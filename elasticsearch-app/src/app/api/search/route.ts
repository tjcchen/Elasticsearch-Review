import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/elasticsearch';
import { SearchRequest } from '@/types/search';

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();
    const { query, index = 'documents', size = 10, from = 0, filters } = body;

    if (!query || query.trim() === '') {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Build the search query
    const searchBody: any = {
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: query,
                fields: ['title^2', 'content', 'tags'],
                type: 'best_fields',
                fuzziness: 'AUTO',
              },
            },
          ],
          filter: [],
        },
      },
      highlight: {
        fields: {
          title: {},
          content: {
            fragment_size: 150,
            number_of_fragments: 3,
          },
        },
      },
      size,
      from,
    };

    // Add filters if provided
    if (filters) {
      if (filters.tags && filters.tags.length > 0) {
        searchBody.query.bool.filter.push({
          terms: { tags: filters.tags },
        });
      }

      if (filters.dateRange) {
        const dateFilter: any = {
          range: {
            created_at: {},
          },
        };

        if (filters.dateRange.from) {
          dateFilter.range.created_at.gte = filters.dateRange.from;
        }

        if (filters.dateRange.to) {
          dateFilter.range.created_at.lte = filters.dateRange.to;
        }

        searchBody.query.bool.filter.push(dateFilter);
      }
    }

    // Perform the search
    const response = await client.search({
      index,
      ...searchBody,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Search API error:', error);
    
    // Handle Elasticsearch connection errors
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { 
          error: 'Elasticsearch server is not available. Please ensure Elasticsearch is running.',
          details: 'Connection refused to Elasticsearch server'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error occurred during search',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Search API endpoint. Use POST method to perform searches.',
      usage: {
        method: 'POST',
        body: {
          query: 'string (required)',
          index: 'string (optional, default: documents)',
          size: 'number (optional, default: 10)',
          from: 'number (optional, default: 0)',
          filters: {
            tags: 'string[] (optional)',
            dateRange: {
              from: 'string (optional)',
              to: 'string (optional)'
            }
          }
        }
      }
    }
  );
}
