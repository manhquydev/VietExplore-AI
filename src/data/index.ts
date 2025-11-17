/**
 * Data exports for Resources page
 * Du Lịch Việt - VietExplore
 */

import emergencyHotlinesData from "./emergency_hotlines.json"
import airlinesData from "./airlines.json"
import airportsData from "./airports.json"
import hospitalsData from "./hospitals.json"
import appsData from "./apps.json"
import { EmergencyHotline, Airline, Airport, Hospital, App, City } from "./types"

// ==================== EMERGENCY HOTLINES ====================
export const emergencyHotlines: EmergencyHotline[] = emergencyHotlinesData as EmergencyHotline[]

// Get active (non-deprecated) hotlines sorted by priority
export const getActiveHotlines = (): EmergencyHotline[] => {
  return emergencyHotlines
    .filter(hotline => !hotline.deprecated)
    .sort((a, b) => a.priority - b.priority)
}

// Get legacy hotlines (for informational purposes)
export const getLegacyHotlines = (): EmergencyHotline[] => {
  return emergencyHotlines
    .filter(hotline => hotline.deprecated === true)
    .sort((a, b) => a.priority - b.priority)
}

// ==================== AIRLINES ====================
export const airlines: Airline[] = airlinesData as Airline[]

// Get airlines by region
export const getAirlinesByRegion = (region: "domestic" | "regional" | "international" | "all" = "all"): Airline[] => {
  if (region === "all") return airlines
  return airlines.filter(airline => airline.region === region)
}

// Get domestic airlines
export const getDomesticAirlines = (): Airline[] => {
  return airlines.filter(airline => airline.region === "domestic")
}

// ==================== AIRPORTS ====================
export const airports: Airport[] = airportsData as Airport[]

// Get airports by city
export const getAirportsByCity = (city: City): Airport[] => {
  if (city === "all") return airports
  return airports.filter(airport => airport.city === city)
}

// ==================== HOSPITALS ====================
export const hospitals: Hospital[] = hospitalsData as Hospital[]

// Get hospitals by city
export const getHospitalsByCity = (city: City): Hospital[] => {
  if (city === "all") return hospitals
  return hospitals.filter(hospital => hospital.city === city)
}

// Get verified 24/7 hospitals only
export const getVerified247Hospitals = (city: City = "all"): Hospital[] => {
  const filtered = city === "all" ? hospitals : hospitals.filter(h => h.city === city)
  return filtered.filter(hospital => hospital.verified_24_7 === true)
}

// ==================== APPS ====================
export const apps: App[] = appsData as App[]

// Get featured apps
export const getFeaturedApps = (): App[] => {
  return apps.filter(app => app.featured === true)
}

// Get apps by category
export const getAppsByCategory = (category: string): App[] => {
  return apps.filter(app => app.category === category)
}

// ==================== SEARCH UTILITIES ====================
// Search across all resources
export const searchResources = (query: string) => {
  const q = query.toLowerCase().trim()

  if (!q) return {
    airlines: [],
    airports: [],
    hospitals: [],
    apps: []
  }

  return {
    airlines: airlines.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    ),
    airports: airports.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      item.address.toLowerCase().includes(q)
    ),
    hospitals: hospitals.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.address.toLowerCase().includes(q) ||
      item.specialties.some(s => s.toLowerCase().includes(q))
    ),
    apps: apps.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    )
  }
}

// Export types
export * from "./types"
