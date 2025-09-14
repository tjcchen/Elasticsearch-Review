import { Client } from '@elastic/elasticsearch';

// Elasticsearch client configuration
const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || 'changeme',
  },
  // For development with self-signed certificates
  tls: {
    rejectUnauthorized: false,
  },
});

export default client;

// Helper function to check if Elasticsearch is connected
export async function checkElasticsearchConnection() {
  try {
    const response = await client.ping();
    return { connected: true, response };
  } catch (error) {
    console.error('Elasticsearch connection failed:', error);
    return { connected: false, error };
  }
}

// Helper function to create an index if it doesn't exist
export async function ensureIndexExists(indexName: string) {
  try {
    const exists = await client.indices.exists({ index: indexName });
    if (!exists) {
      await client.indices.create({
        index: indexName,
        mappings: {
          properties: {
            title: { type: 'text', analyzer: 'standard' },
            content: { type: 'text', analyzer: 'standard' },
            tags: { type: 'keyword' },
            created_at: { type: 'date' },
            updated_at: { type: 'date' },
          },
        },
      });
      console.log(`Index ${indexName} created successfully`);
    }
    return true;
  } catch (error) {
    console.error(`Error creating index ${indexName}:`, error);
    return false;
  }
}
