# Elasticsearch Search Application

A modern, full-stack search application built with Next.js, TypeScript, Tailwind CSS, and Elasticsearch. This application provides a beautiful search interface with powerful Elasticsearch capabilities.

## Features

- 🔍 **Full-text search** with Elasticsearch
- 🎨 **Modern UI** with Tailwind CSS and responsive design
- ⚡ **Fast search** with real-time results
- 🏷️ **Tag-based filtering** and advanced search options
- 📱 **Mobile-friendly** responsive design
- 🌙 **Dark mode** support
- 📊 **Search result highlighting** and relevance scoring
- 🔧 **RESTful API** for document management

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Search Engine**: Elasticsearch
- **Styling**: Tailwind CSS with custom components

## Prerequisites

Before running this application, make sure you have:

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Elasticsearch** (v7.x or v8.x)

## Elasticsearch Setup

### Option 1: Docker (Recommended)
```bash
# Run Elasticsearch with Docker
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  docker.elastic.co/elasticsearch/elasticsearch:8.11.0
```

### Option 2: Local Installation
1. Download Elasticsearch from [elastic.co](https://www.elastic.co/downloads/elasticsearch)
2. Extract and run:
```bash
cd elasticsearch-8.11.0
./bin/elasticsearch
```

## Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Elasticsearch Configuration
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme

# Optional: For production with authentication
# ELASTICSEARCH_API_KEY=your_api_key_here
```

## Installation & Setup

1. **Clone and install dependencies:**
```bash
git clone <your-repo>
cd elasticsearch-app
npm install
```

2. **Start Elasticsearch** (see Elasticsearch Setup above)

3. **Seed sample data:**
```bash
# The application will automatically create the index
# You can seed sample data using the API endpoint
curl -X POST http://localhost:3000/api/seed
```

4. **Start the development server:**
```bash
npm run dev
```

5. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Search
- `POST /api/search` - Perform search queries
- `GET /api/search` - API documentation

### Documents
- `GET /api/documents` - Retrieve documents
- `POST /api/documents` - Create new document
- `PUT /api/documents` - Update document
- `DELETE /api/documents` - Delete document

### Utilities
- `POST /api/seed` - Seed sample data
- `DELETE /api/seed` - Clear all data
- `GET /api/status` - Check Elasticsearch connection status

## Usage Examples

### Search API
```javascript
// Basic search
const response = await fetch('/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'machine learning',
    size: 10
  })
});

// Advanced search with filters
const response = await fetch('/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'javascript',
    filters: {
      tags: ['frontend', 'react'],
      dateRange: {
        from: '2024-01-01',
        to: '2024-12-31'
      }
    }
  })
});
```

### Document Management
```javascript
// Create document
const response = await fetch('/api/documents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'My Document',
    content: 'Document content here...',
    tags: ['tutorial', 'guide']
  })
});
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── search/route.ts      # Search API endpoint
│   │   ├── documents/route.ts   # Document CRUD operations
│   │   ├── seed/route.ts        # Sample data seeding
│   │   └── status/route.ts      # Health check
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main search page
├── components/
│   ├── SearchBox.tsx            # Search input component
│   └── SearchResults.tsx        # Search results display
├── lib/
│   └── elasticsearch.ts         # Elasticsearch client config
└── types/
    └── search.ts                # TypeScript type definitions
```

## Customization

### Elasticsearch Index Mapping
Modify the index mapping in `src/lib/elasticsearch.ts`:

```typescript
const mappings = {
  properties: {
    title: { type: 'text', analyzer: 'standard' },
    content: { type: 'text', analyzer: 'standard' },
    tags: { type: 'keyword' },
    // Add your custom fields here
  }
};
```

### Search Configuration
Customize search behavior in `src/app/api/search/route.ts`:

```typescript
const searchBody = {
  query: {
    multi_match: {
      query: query,
      fields: ['title^2', 'content', 'tags'], // Adjust field weights
      type: 'best_fields',
      fuzziness: 'AUTO', // Enable fuzzy matching
    }
  }
};
```

## Troubleshooting

### Elasticsearch Connection Issues
1. Check if Elasticsearch is running: `curl http://localhost:9200`
2. Verify environment variables in `.env.local`
3. Check the status endpoint: `curl http://localhost:3000/api/status`

### Common Issues
- **Port conflicts**: Change Elasticsearch port if 9200 is in use
- **Memory issues**: Increase Docker memory allocation for Elasticsearch
- **CORS errors**: Ensure Elasticsearch allows connections from your app

## Production Deployment

1. **Environment Variables**: Set production values for Elasticsearch connection
2. **Security**: Enable Elasticsearch security features
3. **Performance**: Configure Elasticsearch cluster for production workloads
4. **Monitoring**: Set up Elasticsearch monitoring and logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
