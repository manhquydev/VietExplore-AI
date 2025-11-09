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
  trustLabel?: string
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
  // Miền Bắc
  { value: "ha-noi", label: "Hà Nội", region: "bac-bo" },
  { value: "hai-phong", label: "Hải Phòng", region: "bac-bo" },
  { value: "quang-ninh", label: "Quảng Ninh", region: "bac-bo" },
  { value: "cao-bang", label: "Cao Bằng", region: "bac-bo" },
  { value: "lao-cai", label: "Lào Cai", region: "bac-bo" },
  { value: "ha-giang", label: "Hà Giang", region: "bac-bo" },

  // Miền Trung
  { value: "da-nang", label: "Đà Nẵng", region: "trung-bo" },
  { value: "quang-nam", label: "Quảng Nam", region: "trung-bo" },
  { value: "thua-thien-hue", label: "Thừa Thiên Huế", region: "trung-bo" },
  { value: "khanh-hoa", label: "Khánh Hòa", region: "trung-bo" },
  { value: "binh-dinh", label: "Bình Định", region: "trung-bo" },
  { value: "phu-yen", label: "Phú Yên", region: "trung-bo" },

  // Miền Nam
  { value: "ho-chi-minh", label: "TP. Hồ Chí Minh", region: "nam-bo" },
  { value: "ba-ria-vung-tau", label: "Bà Rịa - Vũng Tàu", region: "nam-bo" },
  { value: "kien-giang", label: "Kiên Giang", region: "nam-bo" },
  { value: "ca-mau", label: "Cà Mau", region: "nam-bo" },
  { value: "an-giang", label: "An Giang", region: "nam-bo" },
  { value: "lam-dong", label: "Lâm Đồng", region: "nam-bo" },
]

const trustLabels = [
  { value: "verified", label: "Xác minh" },
  { value: "partner", label: "Đối tác" },
  { value: "contributor", label: "Cộng tác viên" },
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
    <div className={cn("w-full space-y-3 sm:space-y-4", className)}>
      {/* Main Search Bar - Mobile-optimized with proper touch targets */}
      <div className="relative">
        <div className="relative flex items-center">
          <Icon name="search" className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4 sm:w-5 sm:h-5" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 sm:pl-12 pr-20 sm:pr-24 h-11 sm:h-12 text-sm sm:text-base bg-white shadow-soft border-border rounded-xl touch-target-44"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm touch-target-44",
                activeFiltersCount > 0 && "bg-primary-50 text-primary"
              )}
            >
              <Icon name="filter" className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
              <span className="hidden sm:inline">Lọc</span>
              {activeFiltersCount > 0 && (
                <Badge variant="default" className="ml-1 h-4 sm:h-5 px-1 sm:px-1.5 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            <Button onClick={handleSearch} className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm touch-target-44">
              Tìm
            </Button>
          </div>
        </div>
      </div>

      {/* Filters - Mobile-optimized layout */}
      {showFilters && (
        <div className="p-3 sm:p-4 bg-surface rounded-xl border border-border space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground text-sm sm:text-base">Bộ lọc tìm kiếm</h3>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs sm:text-sm touch-target-44">
                Xóa tất cả
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Region Filter */}
            <div>
              <label className="text-xs sm:text-sm font-medium text-foreground mb-2 block">
                Vùng miền
              </label>
              <Select
                value={localFilters.region}
                onValueChange={(value) => updateFilter('region', value)}
              >
                <SelectTrigger className="touch-target-44">
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
              <label className="text-xs sm:text-sm font-medium text-foreground mb-2 block">
                Tỉnh/Thành phố
              </label>
              <Select
                value={localFilters.province}
                onValueChange={(value) => updateFilter('province', value)}
                disabled={!localFilters.region}
              >
                <SelectTrigger className="touch-target-44">
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
              <label className="text-xs sm:text-sm font-medium text-foreground mb-2 block">
                Loại hình
              </label>
              <Select
                value={localFilters.type}
                onValueChange={(value) => updateFilter('type', value)}
              >
                <SelectTrigger className="touch-target-44">
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

            {/* Trust Label Filter */}
            <div>
              <label className="text-xs sm:text-sm font-medium text-foreground mb-2 block">
                Độ tin cậy
              </label>
              <Select
                value={localFilters.trustLabel}
                onValueChange={(value) => updateFilter('trustLabel', value)}
              >
                <SelectTrigger className="touch-target-44">
                  <SelectValue placeholder="Chọn độ tin cậy" />
                </SelectTrigger>
                <SelectContent>
                  {trustLabels.map((label) => (
                    <SelectItem key={label.value} value={label.value}>
                      {label.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display - Mobile-optimized */}
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
          {localFilters.trustLabel && (
            <Badge variant="outline" className="gap-2">
              {trustLabels.find(l => l.value === localFilters.trustLabel)?.label}
              <button
                onClick={() => updateFilter('trustLabel', undefined)}
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
