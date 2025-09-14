import { NextRequest, NextResponse } from 'next/server';
import client, { ensureIndexExists } from '@/lib/elasticsearch';
import { Document } from '@/types/search';

// GET - Retrieve documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const index = searchParams.get('index') || 'documents';
    const size = parseInt(searchParams.get('size') || '10');
    const from = parseInt(searchParams.get('from') || '0');

    const response = await client.search({
      index,
      query: { match_all: {} },
      size,
      from,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get documents error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve documents' },
      { status: 500 }
    );
  }
}

// POST - Create a new document
export async function POST(request: NextRequest) {
  try {
    const body: Document & { index?: string } = await request.json();
    const { index = 'documents', ...document } = body;

    // Ensure the index exists
    await ensureIndexExists(index);

    // Add timestamps
    const now = new Date().toISOString();
    const documentWithTimestamps = {
      ...document,
      created_at: now,
      updated_at: now,
    };

    const response = await client.index({
      index,
      document: documentWithTimestamps,
    });

    return NextResponse.json({
      success: true,
      id: response._id,
      document: documentWithTimestamps,
    });
  } catch (error) {
    console.error('Create document error:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}

// PUT - Update a document
export async function PUT(request: NextRequest) {
  try {
    const body: Document & { id: string; index?: string } = await request.json();
    const { id, index = 'documents', ...document } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required for updates' },
        { status: 400 }
      );
    }

    // Add updated timestamp
    const documentWithTimestamp = {
      ...document,
      updated_at: new Date().toISOString(),
    };

    const response = await client.update({
      index,
      id,
      doc: documentWithTimestamp,
    });

    return NextResponse.json({
      success: true,
      id: response._id,
      document: documentWithTimestamp,
    });
  } catch (error) {
    console.error('Update document error:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a document
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const index = searchParams.get('index') || 'documents';

    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required for deletion' },
        { status: 400 }
      );
    }

    await client.delete({
      index,
      id,
    });

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Delete document error:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
