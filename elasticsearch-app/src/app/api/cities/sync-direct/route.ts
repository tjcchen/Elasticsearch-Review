/**
 * Route handler for /api/cities/sync-direct
 * Bulk imports cities data from PostgreSQL to Elasticsearch using direct HTTP calls
 */
import postgres from "postgres";
import { NextRequest, NextResponse } from "next/server";

const sql = postgres(process.env.DATABASE_URL || "", { ssl: "require" });

export type SyncResult = {
  success: boolean;
  message: string;
  totalCities: number;
  indexedCities: number;
  errors?: string[];
};

// Helper function to make authenticated requests to Elasticsearch
async function esRequest(method: string, path: string, body?: any) {
  const https = require('https');
  const url = new URL(`https://127.0.0.1:9200${path}`);
  const auth = Buffer.from('elastic:PzmHvsuMo9PyUS_5Abxp').toString('base64');
  
  const headers: any = {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  if (body) {
    const bodyStr = JSON.stringify(body);
    headers['Content-Length'] = Buffer.byteLength(bodyStr);
  }

  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname + url.search,
    method,
    headers,
    rejectUnauthorized: false // Ignore SSL certificate issues for development
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res: any) => {
      let data = '';
      res.on('data', (chunk: any) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`ES request failed: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

// POST request - sync all cities from PostgreSQL to Elasticsearch
export const POST = async (req: NextRequest) => {
  const startTime = Date.now();
  let result: SyncResult;
  
  try {
    const indexName = 'cities';
    
    // 1. Delete existing index if it exists
    try {
      await esRequest('DELETE', `/${indexName}`);
      console.log(`Deleted existing index: ${indexName}`);
    } catch (error) {
      console.log('Index does not exist, creating new one');
    }

    // 2. Create index with mapping
    const indexConfig = {
      settings: {
        number_of_shards: 1,
        number_of_replicas: 0,
        analysis: {
          analyzer: {
            city_analyzer: {
              type: "custom",
              tokenizer: "standard",
              filter: ["lowercase", "asciifolding"]
            }
          }
        }
      },
      mappings: {
        properties: {
          id: { type: "integer" },
          name: { 
            type: "text",
            analyzer: "city_analyzer",
            fields: {
              keyword: { type: "keyword" },
              suggest: { type: "completion" }
            }
          },
          state: { 
            type: "text",
            analyzer: "city_analyzer",
            fields: {
              keyword: { type: "keyword" }
            }
          },
          population: { type: "integer" },
          description: { 
            type: "text",
            analyzer: "city_analyzer"
          },
          location: {
            type: "text",
            analyzer: "city_analyzer"
          }
        }
      }
    };

    await esRequest('PUT', `/${indexName}`, indexConfig);
    console.log(`Created index: ${indexName}`);

    // 3. Fetch all cities from PostgreSQL
    const cities = await sql`
      SELECT id, name, state, population, description
      FROM cities
      ORDER BY population DESC
    `;

    console.log(`Fetched ${cities.length} cities from PostgreSQL`);

    if (cities.length === 0) {
      result = {
        success: false,
        message: "No cities found in PostgreSQL database",
        totalCities: 0,
        indexedCities: 0
      };
      return NextResponse.json(result, { status: 404 });
    }

    // 4. Prepare bulk operations
    const bulkBody = [];
    
    for (const city of cities) {
      // Add index operation
      bulkBody.push(JSON.stringify({
        index: {
          _index: indexName,
          _id: city.id.toString()
        }
      }));
      
      // Add document data
      bulkBody.push(JSON.stringify({
        id: city.id,
        name: city.name,
        state: city.state,
        population: city.population,
        description: city.description,
        location: `${city.name}, ${city.state}`,
        suggest: {
          input: [city.name, `${city.name}, ${city.state}`, city.state],
          weight: Math.floor(city.population / 1000)
        }
      }));
    }

    // 5. Execute bulk indexing using HTTPS
    const bulkData = bulkBody.join('\n') + '\n';
    
    const https = require('https');
    const auth = Buffer.from('elastic:PzmHvsuMo9PyUS_5Abxp').toString('base64');
    
    const bulkOptions = {
      hostname: '127.0.0.1',
      port: 9200,
      path: '/_bulk?refresh=true',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-ndjson',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(bulkData)
      },
      rejectUnauthorized: false
    };

    const bulkResult = await new Promise((resolve, reject) => {
      const req = https.request(bulkOptions, (res: any) => {
        let data = '';
        res.on('data', (chunk: any) => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(new Error(`Failed to parse bulk response: ${data}`));
            }
          } else {
            reject(new Error(`Bulk request failed: ${res.statusCode} ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.write(bulkData);
      req.end();
    });

    // 6. Check for errors
    const errors = [];
    const bulkResponse = bulkResult as any;
    if (bulkResponse.errors) {
      for (const item of bulkResponse.items) {
        if (item.index?.error) {
          errors.push(`ID ${item.index._id}: ${item.index.error.reason}`);
        }
      }
    }

    const indexedCount = cities.length - errors.length;
    const duration = Date.now() - startTime;

    result = {
      success: errors.length === 0,
      message: errors.length === 0 
        ? `Successfully indexed ${indexedCount} cities in ${duration}ms`
        : `Indexed ${indexedCount}/${cities.length} cities with ${errors.length} errors`,
      totalCities: cities.length,
      indexedCities: indexedCount,
      ...(errors.length > 0 && { errors: errors.slice(0, 10) })
    };

    console.log(result.message);
    
    return NextResponse.json(result, { 
      status: errors.length === 0 ? 200 : 207
    });

  } catch (error) {
    console.error('Sync error:', error);
    
    result = {
      success: false,
      message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      totalCities: 0,
      indexedCities: 0
    };

    return NextResponse.json(result, { status: 500 });
  }
};

// GET request - check sync status
export const GET = async (req: NextRequest) => {
  try {
    const indexName = 'cities';
    const https = require('https');
    const auth = Buffer.from('elastic:PzmHvsuMo9PyUS_5Abxp').toString('base64');
    
    // Check if index exists using HEAD request
    const existsCheck = await new Promise((resolve, reject) => {
      const options = {
        hostname: '127.0.0.1',
        port: 9200,
        path: `/${indexName}`,
        method: 'HEAD',
        headers: {
          'Authorization': `Basic ${auth}`
        },
        rejectUnauthorized: false
      };

      const req = https.request(options, (res: any) => {
        resolve(res.statusCode);
      });

      req.on('error', reject);
      req.end();
    });
    
    if (existsCheck === 404) {
      return NextResponse.json({
        indexed: false,
        message: "Cities index does not exist. Run POST /api/cities/sync-direct to create it.",
        count: 0
      });
    }

    // Get document count
    const countResult = await new Promise((resolve, reject) => {
      const options = {
        hostname: '127.0.0.1',
        port: 9200,
        path: `/${indexName}/_count`,
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        },
        rejectUnauthorized: false
      };

      const req = https.request(options, (res: any) => {
        let data = '';
        res.on('data', (chunk: any) => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(new Error(`Failed to parse count response: ${data}`));
            }
          } else {
            reject(new Error(`Count request failed: ${res.statusCode} ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
    
    const countResponse = countResult as any;
    
    return NextResponse.json({
      indexed: true,
      message: "Cities index exists and is ready",
      count: countResponse.count || 0
    });

  } catch (error) {
    console.error('Status check error:', error);
    
    return NextResponse.json({
      indexed: false,
      message: `Status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      count: 0
    }, { status: 500 });
  }
};
