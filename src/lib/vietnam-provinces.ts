// Vietnam Province API integration
// Using https://tailieu365.com/api/address/ as documented

const API_BASE_URL = 'https://tailieu365.com/api/address';

export interface Province {
  id: number;
  name: string;
  isNew: boolean | null;
  newId: number | null;
}

export interface District {
  id: number;
  name: string;
  provinceId: number;
}

export interface Ward {
  id: number;
  name: string;
  districtId: number | null;
  provinceId: number;
  isNew: boolean | null;
  newId: number | null;
}

// Cache for API responses
const cache = new Map<string, any>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function cachedFetch<T>(url: string): Promise<T> {
  const cacheKey = url;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache the result
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    return data;
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    throw error;
  }
}

export async function getProvinces(): Promise<Province[]> {
  return cachedFetch<Province[]>(`${API_BASE_URL}/province?mode=2`);
}

export async function getDistrictsByProvince(provinceId: number): Promise<District[]> {
  return cachedFetch<District[]>(`${API_BASE_URL}/district?provinceId=${provinceId}`);
}

export async function getWardsByDistrict(districtId: number): Promise<Ward[]> {
  return cachedFetch<Ward[]>(`${API_BASE_URL}/ward?districtId=${districtId}`);
}

export async function getWardsByProvince(provinceId: number): Promise<Ward[]> {
  return cachedFetch<Ward[]>(`${API_BASE_URL}/ward?provinceId=${provinceId}`);
}

// Utility functions
export function findProvinceById(provinces: Province[], id: number): Province | undefined {
  return provinces.find(p => p.id === id);
}

export function findDistrictById(districts: District[], id: number): District | undefined {
  return districts.find(d => d.id === id);
}

export function findWardById(wards: Ward[], id: number): Ward | undefined {
  return wards.find(w => w.id === id);
}

// Search functions
export function searchProvinces(provinces: Province[], query: string): Province[] {
  const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return provinces.filter(province => 
    province.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalizedQuery)
  );
}

export function searchDistricts(districts: District[], query: string): District[] {
  const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return districts.filter(district => 
    district.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalizedQuery)
  );
}

export function searchWards(wards: Ward[], query: string): Ward[] {
  const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return wards.filter(ward => 
    ward.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalizedQuery)
  );
}

// Format full address
export function formatFullAddress(
  wardName?: string, 
  districtName?: string, 
  provinceName?: string
): string {
  const parts = [wardName, districtName, provinceName].filter(Boolean);
  return parts.join(', ');
}

// Clear cache (for testing or manual refresh)
export function clearCache(): void {
  cache.clear();
}