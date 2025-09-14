import { NextResponse } from 'next/server';
import client, { ensureIndexExists } from '@/lib/elasticsearch';

const sampleDocuments = [
  {
    title: "Introduction to Elasticsearch",
    content: "Elasticsearch is a distributed, RESTful search and analytics engine capable of addressing a growing number of use cases. As the heart of the Elastic Stack, it centrally stores your data for lightning fast search, fine‑tuned relevancy, and powerful analytics that scale with ease.",
    tags: ["elasticsearch", "search", "analytics", "tutorial"]
  },
  {
    title: "Machine Learning with Python",
    content: "Machine learning is a method of data analysis that automates analytical model building. It is a branch of artificial intelligence (AI) based on the idea that systems can learn from data, identify patterns and make decisions with minimal human intervention.",
    tags: ["machine learning", "python", "ai", "data science"]
  },
  {
    title: "React Best Practices",
    content: "React is a JavaScript library for building user interfaces. It lets you compose complex UIs from small and isolated pieces of code called components. This guide covers the best practices for writing maintainable React applications.",
    tags: ["react", "javascript", "frontend", "best practices"]
  },
  {
    title: "Database Design Principles",
    content: "Database design is the organization of data according to a database model. The designer determines what data must be stored and how the data elements interrelate. With this information, they can begin to fit the data to the database model.",
    tags: ["database", "design", "sql", "architecture"]
  },
  {
    title: "API Development with Node.js",
    content: "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. It's designed to build scalable network applications. This tutorial covers creating RESTful APIs using Node.js and Express framework.",
    tags: ["nodejs", "api", "javascript", "backend"]
  },
  {
    title: "Docker Container Orchestration",
    content: "Docker is a set of platform as a service products that use OS-level virtualization to deliver software in packages called containers. Container orchestration automates the deployment, management, scaling, and networking of containers.",
    tags: ["docker", "containers", "devops", "orchestration"]
  },
  {
    title: "TypeScript Advanced Features",
    content: "TypeScript is a programming language developed and maintained by Microsoft. It is a strict syntactical superset of JavaScript and adds optional static type checking to the language. This guide explores advanced TypeScript features.",
    tags: ["typescript", "javascript", "programming", "types"]
  },
  {
    title: "Cloud Computing Fundamentals",
    content: "Cloud computing is the on-demand availability of computer system resources, especially data storage and computing power, without direct active management by the user. The term is generally used to describe data centers available to many users over the Internet.",
    tags: ["cloud", "aws", "computing", "infrastructure"]
  }
];

export async function POST() {
  try {
    const indexName = 'documents';
    
    // Ensure the index exists
    const indexCreated = await ensureIndexExists(indexName);
    if (!indexCreated) {
      return NextResponse.json(
        { error: 'Failed to create index' },
        { status: 500 }
      );
    }

    // Check if documents already exist
    const existingDocs = await client.search({
      index: indexName,
      query: { match_all: {} },
      size: 1
    });

    const totalHits = typeof existingDocs.hits.total === 'number' 
      ? existingDocs.hits.total 
      : existingDocs.hits.total?.value || 0;

    if (totalHits > 0) {
      return NextResponse.json({
        message: 'Sample data already exists',
        count: totalHits
      });
    }

    // Seed the documents
    const now = new Date().toISOString();
    const documentsWithTimestamps = sampleDocuments.map(doc => ({
      ...doc,
      created_at: now,
      updated_at: now
    }));

    // Bulk insert documents
    const operations = documentsWithTimestamps.flatMap(doc => [
      { index: { _index: indexName } },
      doc
    ]);

    const response = await client.bulk({ operations });

    if (response.errors) {
      console.error('Bulk insert errors:', response.items);
      return NextResponse.json(
        { error: 'Some documents failed to index' },
        { status: 500 }
      );
    }

    // Refresh the index to make documents searchable immediately
    await client.indices.refresh({ index: indexName });

    return NextResponse.json({
      success: true,
      message: 'Sample data seeded successfully',
      documentsCreated: documentsWithTimestamps.length,
      indexName
    });

  } catch (error) {
    console.error('Seed data error:', error);
    
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
        error: 'Failed to seed sample data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const indexName = 'documents';
    
    // Delete all documents in the index
    await client.deleteByQuery({
      index: indexName,
      query: { match_all: {} }
    });

    return NextResponse.json({
      success: true,
      message: 'All sample data cleared successfully',
      indexName
    });

  } catch (error) {
    console.error('Clear data error:', error);
    return NextResponse.json(
      { error: 'Failed to clear sample data' },
      { status: 500 }
    );
  }
}
