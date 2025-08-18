"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"
import { cn } from "@/lib/utils"

interface SearchFilters {
  region?: string
  province?: string
  type?: string
}

interface SearchBarProps {
  placeholder?: string
  filters?: SearchFilters
  onSearch?: (query: string, filters: SearchFilters) => void
  onFiltersChange?: (filters: SearchFilters) => void
  className?: string
}

const regions = [
  { value: "bac-bo", label: "Miền Bắc" },
  { value: "trung-bo", label: "Miền Trung" },
  { value: "nam-bo", label: "Miền Nam" },
]

const types = [
  { value: "bien", label: "Biển" },
  { value: "nui", label: "Núi" },
  { value: "van-hoa", label: "Văn hóa" },
  { value: "am-thuc", label: "Ẩm thực" },
  { value: "check-in", label: "Check-in" },
]

const provinces = [
  { value: "ha-noi", label: "Hà Nội", region: "bac-bo" },
  { value: "ho-chi-minh", label: "TP. Hồ Chí Minh", region: "nam-bo" },
  { value: "da-nang", label: "Đà Nẵng", region: "trung-bo" },
  { value: "hoi-an", label: "Hội An", region: "trung-bo" },
  { value: "da-lat", label: "Đà Lạt", region: "nam-bo" },
  { value: "nha-trang", label: "Nha Trang", region: "trung-bo" },
  { value: "phu-quoc", label: "Phú Quốc", region: "nam-bo" },
  { value: "ha-long", label: "Hạ Long", region: "bac-bo" },
]

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Tìm kiếm địa điểm, lịch trình...",
  filters = {},
  onSearch,
  onFiltersChange,
  className,
}) => {
  const [query, setQuery] = React.useState("")
  const [localFilters, setLocalFilters] = React.useState<SearchFilters>(filters)
  const [showFilters, setShowFilters] = React.useState(false)

  const handleSearch = () => {
    onSearch?.(query, localFilters)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const updateFilter = (key: keyof SearchFilters, value: string | undefined) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const clearFilters = () => {
    setLocalFilters({})
    onFiltersChange?.({})
  }

  const activeFiltersCount = Object.values(localFilters).filter(Boolean).length
  const availableProvinces = localFilters.region 
    ? provinces.filter(p => p.region === localFilters.region)
    : provinces

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Main Search Bar - Only essential search icon */}
      <div className="relative">
        <div className="relative flex items-center">
          <Icon name="search" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-12 pr-24 h-12 text-base bg-white shadow-soft border-border rounded-xl"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "h-8 px-3",
                activeFiltersCount > 0 && "bg-primary-50 text-primary"
              )}
            >
              <Icon name="filter" className="w-4 h-4 mr-1" />
              {activeFiltersCount > 0 && (
                <Badge variant="default" className="ml-1 h-5 px-1.5 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            <Button onClick={handleSearch} className="h-8">
              Tìm
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 bg-surface rounded-xl border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-text">Bộ lọc tìm kiếm</h3>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Xóa tất cả
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Region Filter */}
            <div>
              <label className="text-sm font-medium text-text mb-2 block">
                Vùng miền
              </label>
              <Select
                value={localFilters.region}
                onValueChange={(value) => updateFilter('region', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vùng" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.value} value={region.value}>
                      {region.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Province Filter */}
            <div>
              <label className="text-sm font-medium text-text mb-2 block">
                Tỉnh/Thành phố
              </label>
              <Select
                value={localFilters.province}
                onValueChange={(value) => updateFilter('province', value)}
                disabled={!localFilters.region}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tỉnh/thành" />
                </SelectTrigger>
                <SelectContent>
                  {availableProvinces.map((province) => (
                    <SelectItem key={province.value} value={province.value}>
                      {province.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="text-sm font-medium text-text mb-2 block">
                Loại hình
              </label>
              <Select
                value={localFilters.type}
                onValueChange={(value) => updateFilter('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại hình" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {localFilters.region && (
            <Badge variant="outline" className="gap-2">
              {regions.find(r => r.value === localFilters.region)?.label}
              <button
                onClick={() => updateFilter('region', undefined)}
                className="ml-1 hover:text-danger"
              >
                ×
              </button>
            </Badge>
          )}
          {localFilters.province && (
            <Badge variant="outline" className="gap-2">
              {provinces.find(p => p.value === localFilters.province)?.label}
              <button
                onClick={() => updateFilter('province', undefined)}
                className="ml-1 hover:text-danger"
              >
                ×
              </button>
            </Badge>
          )}
          {localFilters.type && (
            <Badge variant="outline" className="gap-2">
              {types.find(t => t.value === localFilters.type)?.label}
              <button
                onClick={() => updateFilter('type', undefined)}
                className="ml-1 hover:text-danger"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
