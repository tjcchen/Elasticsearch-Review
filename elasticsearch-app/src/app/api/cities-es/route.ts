/**
 * Route handler for /api/cities-es
 * Searches cities from Elasticsearch instead of PostgreSQL
 */
import { NextRequest, NextResponse } from "next/server";

export type City = {
  id: number;
  name: string;
  state: string;
  population: number;
  description: string;
};

export type SearchResult = {
  cities: City[];
  total: number;
  statusCode: number;
  msg?: string;
};

// Helper function to make authenticated requests to Elasticsearch
async function esSearch(query: string, limit: number = 10) {
  const https = require('https');
  const auth = Buffer.from('elastic:PzmHvsuMo9PyUS_5Abxp').toString('base64');
  
  // Build Elasticsearch query
  const searchBody = {
    size: limit,
    query: query.trim() ? {
      bool: {
        should: [
          // Prefix match on name (for partial matches like "sea" -> "Seattle")
          { prefix: { name: { value: query.toLowerCase(), boost: 3 } } },
          // Wildcard match on name
          { wildcard: { name: { value: `*${query.toLowerCase()}*`, boost: 2.5 } } },
          // Fuzzy match on name
          { match: { name: { query, fuzziness: "AUTO", boost: 2 } } },
          // Exact match on name (highest priority for full matches)
          { match: { "name.keyword": { query, boost: 4 } } },
          // Match on state
          { match: { state: { query, boost: 1.5 } } },
          // Prefix match on state
          { prefix: { state: { value: query.toLowerCase(), boost: 1.3 } } },
          // Match on description
          { match: { description: { query, boost: 1 } } },
          // Match on combined location field
          { match: { location: { query, boost: 2 } } }
        ]
      }
    } : {
      match_all: {}
    },
    sort: [
      "_score",
      { population: { order: "desc" } }
    ]
  };

  const searchData = JSON.stringify(searchBody);
  
  const options = {
    hostname: '127.0.0.1',
    port: 9200,
    path: '/cities/_search',
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Content-Length': Buffer.byteLength(searchData)
    },
    rejectUnauthorized: false
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
            reject(new Error(`Failed to parse search response: ${data}`));
          }
        } else {
          reject(new Error(`Search request failed: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(searchData);
    req.end();
  });
}

// GET request - search cities using Elasticsearch
export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get("q") || "";
  const limit = parseInt(searchParams.get("limit") || "10");

  let result: SearchResult;

  try {
    if (!query.trim()) {
      // Return empty results for empty query
      result = {
        cities: [],
        total: 0,
        statusCode: 200,
        msg: "No search query provided"
      };
      return NextResponse.json(result);
    }

    // Search using Elasticsearch
    const esResponse = await esSearch(query, limit) as any;
    
    // Transform Elasticsearch response to our format
    const cities: City[] = esResponse.hits.hits.map((hit: any) => ({
      id: hit._source.id,
      name: hit._source.name,
      state: hit._source.state,
      population: hit._source.population,
      description: hit._source.description
    }));

    result = {
      cities,
      total: esResponse.hits.total.value,
      statusCode: 200,
      msg: `Found ${cities.length} cities matching "${query}" (${esResponse.took}ms)`
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Elasticsearch search error:', error);
    
    result = {
      cities: [],
      total: 0,
      statusCode: 500,
      msg: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };

    return NextResponse.json(result, { status: 500 });
  }
};

// POST request - for more complex searches with filters
export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { query = "", filters = {} } = body;
    const limit = filters.limit || 10;

    // Build more complex Elasticsearch query
    const searchBody: any = {
      size: limit,
      query: {
        bool: {
          must: query.trim() ? [
            {
              multi_match: {
                query,
                fields: ["name^3", "state^2", "location^2", "description"],
                fuzziness: "AUTO"
              }
            }
          ] : [{ match_all: {} }],
          filter: []
        }
      },
      sort: [
        "_score",
        { population: { order: "desc" } }
      ]
    };

    // Add population filter if specified
    if (filters.minPopulation) {
      searchBody.query.bool.filter.push({
        range: { population: { gte: filters.minPopulation } }
      });
    }

    // Add state filter if specified
    if (filters.state) {
      searchBody.query.bool.filter.push({
        term: { "state.keyword": filters.state }
      });
    }

    const esResponse = await esSearch(query, limit) as any;
    
    const cities: City[] = esResponse.hits.hits.map((hit: any) => ({
      id: hit._source.id,
      name: hit._source.name,
      state: hit._source.state,
      population: hit._source.population,
      description: hit._source.description
    }));

    const result: SearchResult = {
      cities,
      total: esResponse.hits.total.value,
      statusCode: 200,
      msg: `Found ${cities.length} cities with filters (${esResponse.took}ms)`
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Elasticsearch search error:', error);
    
    const result: SearchResult = {
      cities: [],
      total: 0,
      statusCode: 500,
      msg: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };

    return NextResponse.json(result, { status: 500 });
  }
};
