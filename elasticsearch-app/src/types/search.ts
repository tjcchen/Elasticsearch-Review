// Types for search functionality
export interface SearchResult {
  _id: string;
  _score: number;
  _source: {
    title: string;
    content: string;
    tags?: string[];
    created_at: string;
    updated_at: string;
  };
}

export interface SearchResponse {
  hits: {
    total: {
      value: number;
      relation: string;
    };
    hits: SearchResult[];
  };
  took: number;
}

export interface SearchRequest {
  query: string;
  index?: string;
  size?: number;
  from?: number;
  filters?: {
    tags?: string[];
    dateRange?: {
      from?: string;
      to?: string;
    };
  };
}

export interface Document {
  title: string;
  content: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}
