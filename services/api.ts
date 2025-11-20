import { ApiResponse, Property, User, City, FetchOptions, PaginatedResult } from '../types';

const BASE_URL = 'https://api.kishanthaventures.com/v2/api.php/records';

// Helper to keep commas unencoded for PHP-CRUD-API which prefers "page=1,10" over "page=1%2C10"
const buildUrl = (endpoint: string, options: FetchOptions) => {
  const cleanBase = BASE_URL.replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');
  const url = `${cleanBase}/${cleanEndpoint}`;
  
  const params: string[] = [];
  
  // Pagination: page=page,limit
  const page = options.page || 1;
  const limit = options.limit || 10;
  params.push(`page=${page},${limit}`);
  
  // Sorting: order=field,direction
  if (options.sort) {
    params.push(`order=${options.sort},${options.order || 'ASC'}`);
  } else {
    // Default sort
    params.push(`order=created_at,DESC`);
  }
  
  // Filters: filter=field,match,value
  if (options.filters) {
    options.filters.forEach(f => {
      if (f.value && f.value !== 'All') {
        // We encode the value component to handle spaces/special chars safely
        // but keep the commas for the API structure literal
        params.push(`filter=${f.field},${f.match},${encodeURIComponent(f.value)}`);
      }
    });
  }
  
  return `${url}?${params.join('&')}`;
};

export const fetchProperties = async (options: FetchOptions = {}): Promise<PaginatedResult<Property>> => {
  try {
    const url = buildUrl('properties', options);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
        // Content-Type removed to avoid CORS preflight on simple GET requests
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch properties: ${response.status}`);
    }
    
    const data: ApiResponse<Property> = await response.json();
    return {
      records: data.records || [],
      total: data.results || 0
    };
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
};

export const fetchPropertyById = async (id: string): Promise<Property> => {
  try {
    const url = `${BASE_URL}/properties/${id}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch property details: ${response.status}`);
    }

    // PHP-CRUD-API returns the object directly for by-ID requests
    const data: Property = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching property details:', error);
    throw error;
  }
};

export const fetchUsers = async (options: FetchOptions = {}): Promise<PaginatedResult<User>> => {
  try {
    const url = buildUrl('UserProfile', options);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }

    const data: ApiResponse<User> = await response.json();
    return {
      records: data.records || [],
      total: data.results || 0
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const fetchUserById = async (id: string): Promise<User> => {
  try {
    const url = `${BASE_URL}/UserProfile/${id}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user details: ${response.status}`);
    }

    const data: User = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};

export const fetchCities = async (options: FetchOptions = {}): Promise<PaginatedResult<City>> => {
  try {
    const url = buildUrl('city', options);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cities: ${response.status}`);
    }

    const data: ApiResponse<City> = await response.json();
    return {
      records: data.records || [],
      total: data.results || 0
    };
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw error;
  }
};

export const parsePhotos = (jsonString: string): string[] => {
  try {
    if (!jsonString) return [];
    let cleanString = jsonString;
    
    const parsed = JSON.parse(cleanString);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (e) {
    return [];
  }
};