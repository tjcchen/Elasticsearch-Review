/**
 * Route handler for /api/cities/sync
 * Bulk imports cities data from PostgreSQL to Elasticsearch
 */
import postgres from "postgres";
import { NextRequest, NextResponse } from "next/server";
import client from "@/lib/elasticsearch";

const sql = postgres(process.env.DATABASE_URL || "", { ssl: "require" });

export type SyncResult = {
  success: boolean;
  message: string;
  totalCities: number;
  indexedCities: number;
  errors?: string[];
};

// POST request - sync all cities from PostgreSQL to Elasticsearch
export const POST = async (req: NextRequest) => {
  const startTime = Date.now();
  let result: SyncResult;
  
  try {
    // 1. Create or update the cities index mapping
    const indexName = 'cities';
    
    // Check if index exists and delete it for fresh start
    try {
      const indexExists = await client.indices.exists({ index: indexName });
      if (indexExists) {
        await client.indices.delete({ index: indexName });
        console.log(`Deleted existing index: ${indexName}`);
      }
    } catch (error) {
      console.log('Index does not exist, creating new one');
    }

    // Create index with optimized mapping for city search
    await client.indices.create({
      index: indexName,
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
    });

    console.log(`Created index: ${indexName}`);

    // 2. Fetch all cities from PostgreSQL
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

    // 3. Prepare bulk operations for Elasticsearch
    const bulkOperations = [];
    
    for (const city of cities) {
      // Add index operation
      bulkOperations.push({
        index: {
          _index: indexName,
          _id: city.id.toString()
        }
      });
      
      // Add document data with additional searchable fields
      bulkOperations.push({
        id: city.id,
        name: city.name,
        state: city.state,
        population: city.population,
        description: city.description,
        location: `${city.name}, ${city.state}`, // Combined field for better search
        suggest: {
          input: [city.name, `${city.name}, ${city.state}`, city.state],
          weight: Math.floor(city.population / 1000) // Weight by population for relevance
        }
      });
    }

    // 4. Execute bulk indexing
    const bulkResponse = await client.bulk({
      refresh: true,
      body: bulkOperations
    });

    // 5. Check for errors in bulk response
    const errors = [];
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
      ...(errors.length > 0 && { errors: errors.slice(0, 10) }) // Limit error messages
    };

    console.log(result.message);
    
    return NextResponse.json(result, { 
      status: errors.length === 0 ? 200 : 207 // 207 = Multi-Status (partial success)
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

// GET request - check sync status and index info
export const GET = async (req: NextRequest) => {
  try {
    const indexName = 'cities';
    
    // Check if index exists
    const indexExists = await client.indices.exists({ index: indexName });
    
    if (!indexExists) {
      return NextResponse.json({
        indexed: false,
        message: "Cities index does not exist. Run POST /api/cities/sync to create it.",
        count: 0
      });
    }

    // Get index stats
    const stats = await client.indices.stats({ index: indexName });
    const count = await client.count({ index: indexName });
    
    return NextResponse.json({
      indexed: true,
      message: "Cities index exists and is ready",
      count: count.count,
      indexSize: stats.indices?.[indexName]?.total?.store?.size_in_bytes || 0,
      lastModified: stats.indices?.[indexName]?.total?.refresh?.total_time_in_millis || 0
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
