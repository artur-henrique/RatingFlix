export interface PaginationParams {
  page: number;
  perPage: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
}
