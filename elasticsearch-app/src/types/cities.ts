// Types for cities from PostgreSQL database
export interface City {
  id: number;
  name: string;
  state: string;
  population: number;
  description: string;
}

export interface CitySearchResult {
  cities: City[];
  total: number;
  statusCode: number;
  msg?: string;
}
