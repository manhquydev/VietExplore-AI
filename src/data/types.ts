/**
 * Type definitions for Resources page data
 * Du Lịch Việt - VietExplore
 */

export interface EmergencyHotline {
  id: string
  number: string
  name: string
  description: string
  icon: string
  color: "red" | "pink" | "orange" | "gray"
  tel_link: string
  source: string
  source_url: string | null
  effective_date: string
  priority: number
  categories: string[]
  deprecated?: boolean
  redirect_to?: string
}

export interface Airline {
  id: string
  name: string
  code: string
  logo_url: string
  website: string
  booking_link: string
  phone_display: string
  tel_link: string
  support_url: string
  description: string
  region?: "domestic" | "regional" | "international"
}

export interface Airport {
  id: string
  name: string
  city: string
  code: string
  website: string
  phone_display: string
  tel_link: string
  address: string
  map_link: string
  distance_to_city: string
  travel_time: string
  transport_options: string[]
}

export interface Hospital {
  id: string
  name: string
  address: string
  phone_display: string
  tel_link: string
  map_link: string
  specialties: string[]
  verified_24_7: boolean
  last_verified: string
  city: string
}

export interface App {
  id: string
  name: string
  category: string
  icon: string
  description: string
  app_stores: {
    play_store: string
    app_store: string
  }
  featured?: boolean
}

// Helper type for city filtering
export type City = "hanoi" | "hcm" | "danang" | "cantho" | "all"

export const CITIES: Record<City, string> = {
  hanoi: "Hà Nội",
  hcm: "TP. Hồ Chí Minh",
  danang: "Đà Nẵng",
  cantho: "Cần Thơ",
  all: "Tất cả"
}
