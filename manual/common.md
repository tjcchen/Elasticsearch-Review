## Common Commands

```bash
# Check Elasticsearch indices (tables)
GET _cat/indices?v                 # List all indices
GET _cat/indices/cities?v          # List cities index
GET _cat/indices/my-first-index?v  # List my-first-index

# Show 50 records from cities index
GET cities/_search
{
  "size": 50,
  "query": {
    "match_all": {}
  }
}

# Show 50 records from cities index with specific fields
GET cities/_search
{
  "size": 50,
  "query": {
    "match_all": {}
  },
  "_source": ["name", "state", "population"]
}

# Filter by field (like query q=chicago)
GET cities/_search
{
  "query": {
    "match": {
      "name": "chicago"
    }
  }
}

#########################################################
# Sync cities data from PostgreSQL to Elasticsearch
#########################################################
# Check Current Sync Status
curl http://localhost:3001/api/cities/sync-direct

# Run the Cities Data Sync
curl -X POST http://localhost:3001/api/cities/sync-direct

#########################################################
# Search cities using Elasticsearch
#########################################################
# Your current PostgreSQL endpoint
curl "http://localhost:3001/api/cities?q=tacoma&limit=5"

# New Elasticsearch endpoint (drop-in replacement)
curl "http://localhost:3001/api/cities-es?q=tacoma&limit=5"
```
