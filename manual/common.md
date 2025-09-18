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
```
