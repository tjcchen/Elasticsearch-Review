## Install Elasticsearch

```bash
# 1. Install with docker
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -e "discovery.type=single-node" \
  docker.elastic.co/elasticsearch/elasticsearch:8.15.3

# 2. Other docker commands
docker ps                    # Check if Elasticsearch is running
docker logs -f elasticsearch # Check logs
docker stop elasticsearch    # Stop Elasticsearch
docker start elasticsearch   # Start Elasticsearch
docker rm -f elasticsearch   # Remove Elasticsearch

# 3. Find elastic search password from docker logs
docker exec -it elasticsearch /bin/bash -c \
  "/usr/share/elasticsearch/bin/elasticsearch-reset-password -u elastic --batch"

# Password: PzmHvsuMo9PyUS_5Abxp

# 4. Test ES connection
## Security in enabled, use curl with username and password
# eg: curl -u elastic:PzmHvsuMo9PyUS_5Abxp -k https://localhost:9200/
curl -u elastic:YOUR_NEW_PASSWORD -k https://localhost:9200/

## Security in disabled, use curl without username and password
curl http://localhost:9200/


######################################
# Elasticsearch API
######################################
# Cluster health
curl -u elastic:PzmHvsuMo9PyUS_5Abxp -k https://localhost:9200/_cluster/health?pretty

# List indices - You’ll probably see no indices yet (just system ones)
curl -u elastic:PzmHvsuMo9PyUS_5Abxp -k https://localhost:9200/_cat/indices?v

# Create your first index (like create a table)
curl -u elastic:PzmHvsuMo9PyUS_5Abxp -k \
  -H "Content-Type: application/json" \
  -X PUT "https://localhost:9200/my-first-index" \
  -d '{
    "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
    "mappings": {
      "properties": {
        "title": { "type": "text" },
        "tags":  { "type": "keyword" },
        "date":  { "type": "date" }
      }
    }
  }''

# Index a document (like insert a row)
curl -u elastic:PzmHvsuMo9PyUS_5Abxp -k \
  -H "Content-Type: application/json" \
  -X POST "https://localhost:9200/my-first-index/_doc/1" \
  -d '{
    "title": "Hello Elasticsearch",
    "tags": ["docker","test"],
    "date": "2025-09-18"
  }''

# Search documents (like select * from table)
curl -u elastic:PzmHvsuMo9PyUS_5Abxp -k \
  -H "Content-Type: application/json" \
  "https://localhost:9200/my-first-index/_search?pretty" \
  -d '{
    "query": { "match": { "title": "hello" } }
  }''

# Delete index (like drop table)
curl -u elastic:PzmHvsuMo9PyUS_5Abxp -k \
  -X DELETE "https://localhost:9200/my-first-index"
```