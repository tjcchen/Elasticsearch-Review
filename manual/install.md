## Install Elasticsearch

```bash
# 1. Install with homebrew
# Update Homebrew
brew update

# Install Elasticsearch
brew tap elastic/tap
brew install elastic/tap/elasticsearch-full

# 2. Start Elasticsearch
elasticsearch

# 3. Check if Elasticsearch is running
curl http://localhost:9200
```