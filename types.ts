export interface Property {
  id: string;
  created_at: string;
  updated_at?: string;
  name: string;
  propertyType: string | null;
  photos: string; // JSON string in API
  size: string;
  price: string;
  landmark: string;
  area: string;
  city: string;
  state: string | null;
  bedrooms: string;
  bathrooms: string;
  address: string | null;
  furnishType: string;
  description: string;
  maintenance: string;
  hasLift: string;
  carParking: string;
  bikeParking: string;
  isFeatured: number;
  status: number;
  propertyFor: string;
}

export interface User {
  id: string;
  created_at: string;
  name: string;
  userType: 'TENANT' | 'OWNER' | 'ADMIN';
  email: string;
  phone: string;
  activeStatus: string;
  isVerified: boolean;
  addressCity: string | null;
}

export interface City {
  id: string;
  city: string;
  subName: string | null;
  created_at: string;
  updated_at: string;
  active: boolean;
}

export interface ApiResponse<T> {
  records: T[];
  results: number;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface Filter {
  field: string;
  match: 'cs' | 'sw' | 'ew' | 'eq' | 'lt' | 'le' | 'ge' | 'gt' | 'bt' | 'in' | 'is';
  value: string;
}

export interface FetchOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
  filters?: Filter[];
}

export interface PaginatedResult<T> {
  records: T[];
  total: number;
}