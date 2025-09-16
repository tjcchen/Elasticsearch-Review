/**
 * Route handler for /api/cities
 * Searches cities from Neon PostgreSQL database
 */
import postgres from "postgres";
import { NextRequest, NextResponse } from "next/server";

const sql = postgres(process.env.DATABASE_URL || "", { ssl: "require" });

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

// GET request - search cities
export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get("q") || "";
  const limit = parseInt(searchParams.get("limit") || "10");

  let result: SearchResult;

  try {
    let cities: City[];

    if (!query.trim()) {
      // If no query, return all cities
      cities = await sql`
        SELECT id, name, state, population, description
        FROM cities
        ORDER BY population DESC
        LIMIT ${limit}
      `;
    } else {
      // Search cities by name, state, or description
      cities = await sql`
        SELECT id, name, state, population, description
        FROM cities
        WHERE 
          name ILIKE ${'%' + query + '%'} OR
          state ILIKE ${'%' + query + '%'} OR
          description ILIKE ${'%' + query + '%'}
        ORDER BY 
          CASE 
            WHEN name ILIKE ${'%' + query + '%'} THEN 1
            WHEN state ILIKE ${'%' + query + '%'} THEN 2
            ELSE 3
          END,
          population DESC
        LIMIT ${limit}
      `;
    }

    result = {
      cities: cities as City[],
      total: cities.length,
      statusCode: 200,
      msg: query ? `Found ${cities.length} cities matching "${query}"` : `Retrieved ${cities.length} cities`
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Database error:', error);
    
    result = {
      cities: [],
      total: 0,
      statusCode: 500,
      msg: "Database connection error"
    };

    return NextResponse.json(result, { status: 500 });
  }
};

// POST request - for more complex searches (optional)
export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { query = "", filters = {} } = body;
    const limit = filters.limit || 10;

    let cities: City[];

    if (!query.trim()) {
      cities = await sql`
        SELECT id, name, state, population, description
        FROM cities
        ORDER BY population DESC
        LIMIT ${limit}
      `;
    } else {
      cities = await sql`
        SELECT id, name, state, population, description
        FROM cities
        WHERE 
          name ILIKE ${'%' + query + '%'} OR
          state ILIKE ${'%' + query + '%'} OR
          description ILIKE ${'%' + query + '%'}
        ORDER BY 
          CASE 
            WHEN name ILIKE ${'%' + query + '%'} THEN 1
            WHEN state ILIKE ${'%' + query + '%'} THEN 2
            ELSE 3
          END,
          population DESC
        LIMIT ${limit}
      `;
    }

    const result: SearchResult = {
      cities: cities as City[],
      total: cities.length,
      statusCode: 200,
      msg: `Found ${cities.length} cities`
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Search error:', error);
    
    const result: SearchResult = {
      cities: [],
      total: 0,
      statusCode: 500,
      msg: "Search failed"
    };

    return NextResponse.json(result, { status: 500 });
  }
};
