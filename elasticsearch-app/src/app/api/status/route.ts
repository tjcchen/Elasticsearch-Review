import { NextResponse } from 'next/server';
import { checkElasticsearchConnection } from '@/lib/elasticsearch';

export async function GET() {
  try {
    const connectionStatus = await checkElasticsearchConnection();
    
    const elasticsearchInfo: any = {
      connected: connectionStatus.connected
    };
    
    if (connectionStatus.error) {
      elasticsearchInfo.error = connectionStatus.error;
    }
    
    if (connectionStatus.response) {
      elasticsearchInfo.info = connectionStatus.response;
    }

    return NextResponse.json({
      elasticsearch: elasticsearchInfo,
      api: {
        status: 'healthy',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        elasticsearch: {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        api: {
          status: 'error',
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}
