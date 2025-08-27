"use client"

import * as React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AlertCircle } from "lucide-react"
import { 
  getProvinces, 
  getDistrictsByProvince, 
  getWardsByDistrict,
  searchProvinces,
  searchDistricts,
  searchWards,
  formatFullAddress,
  type Province,
  type District,
  type Ward
} from "@/lib/vietnam-provinces"

interface VietnamAddressSelectorProps {
  value?: {
    provinceId?: number
    districtId?: number 
    wardId?: number
    fullAddress?: string
  }
  onChange?: (value: {
    provinceId?: number
    districtId?: number
    wardId?: number
    fullAddress?: string
    provinceName?: string
    districtName?: string
    wardName?: string
  }) => void
  required?: boolean
  disabled?: boolean
  showWards?: boolean // Whether to show ward selection
}

export function VietnamAddressSelector({ 
  value, 
  onChange, 
  required, 
  disabled,
  showWards = false
}: VietnamAddressSelectorProps) {
  const [provinces, setProvinces] = React.useState<Province[]>([])
  const [districts, setDistricts] = React.useState<District[]>([])
  const [wards, setWards] = React.useState<Ward[]>([])
  
  const [loadingProvinces, setLoadingProvinces] = React.useState(false)
  const [loadingDistricts, setLoadingDistricts] = React.useState(false)
  const [loadingWards, setLoadingWards] = React.useState(false)
  
  const [error, setError] = React.useState<string>("")
  
  const [provinceSearch, setProvinceSearch] = React.useState("")
  const [districtSearch, setDistrictSearch] = React.useState("")
  const [wardSearch, setWardSearch] = React.useState("")

  // Load provinces on mount
  React.useEffect(() => {
    async function loadProvinces() {
      setLoadingProvinces(true)
      setError("")
      try {
        const data = await getProvinces()
        setProvinces(data)
      } catch (err: any) {
        setError("Không thể tải danh sách tỉnh/thành phố")
        console.error("Error loading provinces:", err)
      } finally {
        setLoadingProvinces(false)
      }
    }
    
    loadProvinces()
  }, [])

  // Load districts when province changes
  React.useEffect(() => {
    if (!value?.provinceId) {
      setDistricts([])
      setWards([])
      return
    }

    async function loadDistricts() {
      setLoadingDistricts(true)
      try {
        const data = await getDistrictsByProvince(value.provinceId!)
        setDistricts(data)
        setWards([]) // Clear wards when province changes
      } catch (err: any) {
        console.error("Error loading districts:", err)
        setDistricts([])
      } finally {
        setLoadingDistricts(false)
      }
    }

    loadDistricts()
  }, [value?.provinceId])

  // Load wards when district changes
  React.useEffect(() => {
    if (!showWards || !value?.districtId) {
      setWards([])
      return
    }

    async function loadWards() {
      setLoadingWards(true)
      try {
        const data = await getWardsByDistrict(value.districtId!)
        setWards(data)
      } catch (err: any) {
        console.error("Error loading wards:", err)
        setWards([])
      } finally {
        setLoadingWards(false)
      }
    }

    loadWards()
  }, [value?.districtId, showWards])

  const handleProvinceChange = (provinceId: string) => {
    const id = parseInt(provinceId)
    const province = provinces.find(p => p.id === id)
    
    onChange?.({
      provinceId: id,
      districtId: undefined,
      wardId: undefined,
      provinceName: province?.name,
      districtName: undefined,
      wardName: undefined,
      fullAddress: province?.name || ""
    })
  }

  const handleDistrictChange = (districtId: string) => {
    const id = parseInt(districtId)
    const district = districts.find(d => d.id === id)
    const province = provinces.find(p => p.id === value?.provinceId)
    
    const fullAddress = formatFullAddress(
      undefined,
      district?.name,
      province?.name
    )
    
    onChange?.({
      ...value,
      districtId: id,
      wardId: undefined,
      districtName: district?.name,
      wardName: undefined,
      fullAddress
    })
  }

  const handleWardChange = (wardId: string) => {
    const id = parseInt(wardId)
    const ward = wards.find(w => w.id === id)
    const district = districts.find(d => d.id === value?.districtId)
    const province = provinces.find(p => p.id === value?.provinceId)
    
    const fullAddress = formatFullAddress(
      ward?.name,
      district?.name,
      province?.name
    )
    
    onChange?.({
      ...value,
      wardId: id,
      wardName: ward?.name,
      fullAddress
    })
  }

  const filteredProvinces = provinceSearch 
    ? searchProvinces(provinces, provinceSearch)
    : provinces

  const filteredDistricts = districtSearch
    ? searchDistricts(districts, districtSearch)
    : districts

  const filteredWards = wardSearch
    ? searchWards(wards, wardSearch)
    : wards

  if (error) {
    return (
      <div className="space-y-2">
        <Label>Địa chỉ</Label>
        <div className="flex items-center gap-2 p-3 border border-red-200 rounded-md bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Province Selection */}
      <div className="space-y-2">
        <Label>
          Tỉnh/Thành phố {required && <span className="text-red-500">*</span>}
        </Label>
        {loadingProvinces ? (
          <div className="flex items-center gap-2 p-3 border rounded-md">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-gray-600">Đang tải tỉnh/thành phố...</span>
          </div>
        ) : (
          <Select 
            value={value?.provinceId?.toString() || ""} 
            onValueChange={handleProvinceChange}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn tỉnh/thành phố" />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2">
                <Input
                  placeholder="Tìm kiếm tỉnh/thành phố..."
                  value={provinceSearch}
                  onChange={(e) => setProvinceSearch(e.target.value)}
                  className="h-8"
                />
              </div>
              {filteredProvinces.map((province) => (
                <SelectItem key={province.id} value={province.id.toString()}>
                  {province.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* District Selection */}
      {value?.provinceId && (
        <div className="space-y-2">
          <Label>Quận/Huyện</Label>
          {loadingDistricts ? (
            <div className="flex items-center gap-2 p-3 border rounded-md">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-gray-600">Đang tải quận/huyện...</span>
            </div>
          ) : (
            <Select 
              value={value?.districtId?.toString() || ""} 
              onValueChange={handleDistrictChange}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn quận/huyện" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <Input
                    placeholder="Tìm kiếm quận/huyện..."
                    value={districtSearch}
                    onChange={(e) => setDistrictSearch(e.target.value)}
                    className="h-8"
                  />
                </div>
                {filteredDistricts.map((district) => (
                  <SelectItem key={district.id} value={district.id.toString()}>
                    {district.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {/* Ward Selection */}
      {showWards && value?.districtId && (
        <div className="space-y-2">
          <Label>Xã/Phường</Label>
          {loadingWards ? (
            <div className="flex items-center gap-2 p-3 border rounded-md">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-gray-600">Đang tải xã/phường...</span>
            </div>
          ) : (
            <Select 
              value={value?.wardId?.toString() || ""} 
              onValueChange={handleWardChange}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn xã/phường" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <Input
                    placeholder="Tìm kiếm xã/phường..."
                    value={wardSearch}
                    onChange={(e) => setWardSearch(e.target.value)}
                    className="h-8"
                  />
                </div>
                {filteredWards.map((ward) => (
                  <SelectItem key={ward.id} value={ward.id.toString()}>
                    {ward.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {/* Full Address Display */}
      {value?.fullAddress && (
        <div className="space-y-2">
          <Label>Địa chỉ đầy đủ</Label>
          <div className="p-3 bg-gray-50 border rounded-md">
            <p className="text-sm text-gray-700">{value.fullAddress}</p>
          </div>
        </div>
      )}
    </div>
  )
}