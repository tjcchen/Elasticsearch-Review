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


#####################################################
# Kibana
#####################################################
# install with docker
docker run -d --name kibana \
  -p 5601:5601 \
  --link elasticsearch:elasticsearch \
  docker.elastic.co/kibana/kibana:8.15.3

# check if kibana is running
docker ps

# open kibana in browser
http://localhost:5601

# get the kibana enrollment token (`-s kibana` tells Elasticsearch to generate a token specifically for Kibana.)
# eyJ2ZXIiOiI4LjE0LjAiLCJhZHIiOlsiMTcyLjE3LjAuMjo5MjAwIl0sImZnciI6ImZiMTYxNjJlNDVhNTYxYzkxNGRjYWQxN2I1MjA4YTY1MTc0NzY5MTcxNDQ0ZmIyZmZjNTIyY2YxY2M3YTMwOTAiLCJrZXkiOiJHM0RnV3BrQnVfTllvaDhwNWUwVTppS2htOS1ydFQ1cWFDckhDN0p6YVdBIn0=
docker exec -it elasticsearch \
  /usr/share/elasticsearch/bin/elasticsearch-create-enrollment-token -s kibana

# get the kibana verification code
# eg: 941 804
docker exec -it kibana \
  /usr/share/kibana/bin/kibana-verification-code

# username and password for connecting to Elasticsearch
# username: elastic
# password: PzmHvsuMo9PyUS_5Abxp

# kibana sample commands
GET _cluster/health # Check cluster health
GET _cat/indices?v  # List indices

# Search documents
GET my-first-index/_search { "query": { "match": { "title": "hello" } } }

# Cluster & health
GET /                   # Shows cluster info (name, version, tagline).
GET _cluster/health     # Quick check if cluster is green / yellow / red.
GET _cat/nodes?v        # List nodes with IPs, roles, memory, etc.
GET _cat/indices?v      # List all indices with health, size, docs count.

# Index management
# Create an index with mappings.
PUT my-first-index
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "properties": {
      "title":   { "type": "text" },
      "tags":    { "type": "keyword" },
      "date":    { "type": "date" }
    }
  }
}

# Delete an index
DELETE my-first-index

# Document operations
# Index a document (like insert a row)
# Insert/update document with ID 1
POST my-first-index/_doc/1
{
  "title": "Hello Elasticsearch",
  "tags": ["intro","demo"],
  "date": "2025-09-18"
}

# Fetch one document by ID
GET my-first-index/_doc/1

# Delete one document
DELETE my-first-index/_doc/1

# Search queries
# Return all docs
GET my-first-index/_search
{
  "query": { "match_all": {} }
}
```