/**
 * Test Elasticsearch connection
 */
import { NextRequest, NextResponse } from "next/server";
import client from "@/lib/elasticsearch";

export async function GET(req: NextRequest) {
  try {
    // Test basic connection
    const ping = await client.ping();
    
    // Get cluster info
    const info = await client.info();
    
    return NextResponse.json({
      success: true,
      message: "Elasticsearch connection successful",
      ping,
      cluster: {
        name: info.cluster_name,
        version: info.version.number,
        lucene_version: info.version.lucene_version
      }
    });
    
  } catch (error) {
    console.error('Elasticsearch test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: error instanceof Error ? error.stack : error
    }, { status: 500 });
  }
}
