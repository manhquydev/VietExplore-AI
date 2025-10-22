"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FilterBarProps {
  onFiltersChange: (filters: {
    region?: string
    province?: string
    type?: string
    trustLabel?: string
  }) => void
  initialFilters?: {
    region?: string
    province?: string
    type?: string
    trustLabel?: string
  }
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

const trustLabels = [
  { value: "special_verified", label: "Xác minh đặc biệt" },
  { value: "verified", label: "Xác minh" },
  { value: "partner", label: "Đối tác" },
  { value: "contributor", label: "Đóng góp" },
  { value: "community", label: "Cộng đồng" },
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

export const FilterBar: React.FC<FilterBarProps> = ({
  onFiltersChange,
  initialFilters = {},
  className,
}) => {
  const [filters, setFilters] = React.useState<{
    region?: string
    province?: string
    type?: string
    trustLabel?: string
  }>(initialFilters)

  // Initialize filters from props
  React.useEffect(() => {
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      setFilters(initialFilters)
    }
  }, [initialFilters])

  const updateFilter = (key: string, value: string | undefined) => {
    const newFilters = { ...filters, [key]: value }
    
    // Reset province if region changes
    if (key === 'region' && value !== filters.region) {
      newFilters.province = undefined
    }
    
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    const emptyFilters = {}
    setFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const activeFiltersCount = Object.values(filters).filter(Boolean).length
  const availableProvinces = filters.region 
    ? provinces.filter(p => p.region === filters.region)
    : provinces

  return (
    <div className={cn("glass-card p-4 sm:p-6 mb-6 sm:mb-8", className)}>
      <div className="flex flex-col gap-3 sm:gap-4">
          {/* Filter Controls - Mobile-first responsive layout */}
          <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4">
            {/* Region Filter */}
            <div className="min-w-[140px] sm:min-w-[160px] flex-1 sm:flex-none">
              <Select
                value={filters.region || ''}
                onValueChange={(value) => updateFilter('region', value || undefined)}
              >
                <SelectTrigger className="h-9 sm:h-10 text-sm touch-target-44">
                  <SelectValue placeholder="Vùng miền" />
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
            <div className="min-w-[140px] sm:min-w-[160px] flex-1 sm:flex-none">
              <Select
                value={filters.province || ''}
                onValueChange={(value) => updateFilter('province', value || undefined)}
                disabled={!filters.region}
              >
                <SelectTrigger className="h-9 sm:h-10 text-sm touch-target-44">
                  <SelectValue placeholder="Tỉnh/Thành phố" />
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
            <div className="min-w-[120px] sm:min-w-[140px] flex-1 sm:flex-none">
              <Select
                value={filters.type || ''}
                onValueChange={(value) => updateFilter('type', value || undefined)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Loại hình" />
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
            <div className="min-w-[140px]">
              <Select
                value={filters.trustLabel || ''}
                onValueChange={(value) => updateFilter('trustLabel', value || undefined)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Độ tin cậy" />
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

            {/* Clear All Button */}
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-9 px-3"
              >
                <X className="w-4 h-4 mr-1" />
                Xóa tất cả ({activeFiltersCount})
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.region && (
                <Badge variant="outline" className="gap-2">
                  Vùng: {regions.find(r => r.value === filters.region)?.label}
                  <button
                    onClick={() => updateFilter('region', undefined)}
                    className="ml-1 hover:text-danger"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              {filters.province && (
                <Badge variant="outline" className="gap-2">
                  Tỉnh: {provinces.find(p => p.value === filters.province)?.label}
                  <button
                    onClick={() => updateFilter('province', undefined)}
                    className="ml-1 hover:text-danger"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              {filters.type && (
                <Badge variant="outline" className="gap-2">
                  Loại: {types.find(t => t.value === filters.type)?.label}
                  <button
                    onClick={() => updateFilter('type', undefined)}
                    className="ml-1 hover:text-danger"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              {filters.trustLabel && (
                <Badge variant="outline" className="gap-2">
                  Tin cậy: {trustLabels.find(l => l.value === filters.trustLabel)?.label}
                  <button
                    onClick={() => updateFilter('trustLabel', undefined)}
                    className="ml-1 hover:text-danger"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
    </div>
  )
}

