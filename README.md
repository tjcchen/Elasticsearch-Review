## Elasticsearch-Review

Elasticsearch is `a widely used, high-performance distributed search and analytics engine built on Apache Lucene that stores data as JSON documents and uses inverted indices for fast, full-text search`. It excels at near real-time searching, logging, business and security analytics, and powering AI applications. Elasticsearch is highly scalable, resilient, and accessed via REST APIs, making it a versatile tool for handling and analyzing vast amounts of diverse data.  

## Key Functions

- `Search Engine`: Elasticsearch's primary role is to provide fast and highly relevant `full-text search`. It can index and query structured and unstructured data, making it a great solution for applications like website search, product catalogs, and document retrieval. Unlike traditional databases, it's optimized for text-based queries, returning ranked results based on relevance.

- `Analytics Engine`: Beyond search, Elasticsearch excels at performing `data analytics and aggregations`. It can quickly calculate sums, averages, counts, and other metrics across billions of documents. This capability makes it popular for business intelligence, log analysis, and real-time dashboards.


## Core Concepts

- `Document`: The basic unit of data in Elasticsearch. A document is a JSON object containing your data. It's similar to a `row` in a relational database.

- `Index`: An index is a collection of documents with similar characteristics. It's comparable to a `table` in a relational database.

- `Distributed Architecture`: Elasticsearch is built to scale horizontally. It can run on a single machine or across a cluster of many nodes, providing high availability and fault tolerance. Data is divided into `shards`, which are distributed across the nodes to handle large datasets and high query loads.


## Elasticsearch Tools

- `Kibana`: Kibana is a visualization tool that provides a user interface for exploring and analyzing data in Elasticsearch. It allows users to create visualizations, dashboards, and reports to gain insights into their data.

- Kibana Link: https://www.elastic.co/kibana
