"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Settings, 
  Clock, 
  Users, 
  Shield, 
  Save,
  RotateCcw,
  AlertTriangle
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useFirebaseAuth } from "@/hooks/use-firebase-auth"
import { useToast } from "@/hooks/use-toast"
import { BrandedLoading } from "@/components/ui/branded-loading"

interface SystemConfig {
  sla: {
    moderationTimeLimit: number // hours
    reportResponseTime: number // hours
    escalationTimeout: number // hours
  }
  rateLimits: {
    maxDraftsPerUser: number
    maxReportsPerUserPerWeek: number
    maxCommentsPerUserPerHour: number
    maxSubmissionsPerDay: number
  }
  moderation: {
    maxAssignedPlacesPerModerator: number
    autoEscalationEnabled: boolean
    requireSecondApproval: boolean
  }
  notifications: {
    emailEnabled: boolean
    pushEnabled: boolean
    slackWebhookUrl: string
  }
}

const defaultConfig: SystemConfig = {
  sla: {
    moderationTimeLimit: 48,
    reportResponseTime: 24,
    escalationTimeout: 72
  },
  rateLimits: {
    maxDraftsPerUser: 10,
    maxReportsPerUserPerWeek: 5,
    maxCommentsPerUserPerHour: 20,
    maxSubmissionsPerDay: 3
  },
  moderation: {
    maxAssignedPlacesPerModerator: 10,
    autoEscalationEnabled: true,
    requireSecondApproval: false
  },
  notifications: {
    emailEnabled: true,
    pushEnabled: true,
    slackWebhookUrl: ''
  }
}

export default function SystemConfigPage() {
  const { user } = useAuth()
  const { firebaseUser, loading: authLoading, getIdToken } = useFirebaseAuth()
  const { toast } = useToast()
  
  const [config, setConfig] = useState<SystemConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Permission check
  const canManageConfig = user && user.role === 'admin'

  // Load current config
  useEffect(() => {
    if (!canManageConfig || authLoading || !firebaseUser) {
      if (!authLoading) setLoading(false)
      return
    }
    
    const loadConfig = async () => {
      try {
        const token = await getIdToken()
        if (!token) {
          throw new Error('Authentication required')
        }
        
        const response = await fetch('/api/admin/system/config', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setConfig(result.data)
          } else {
            throw new Error(result.error)
          }
        } else {
          throw new Error('Failed to load config')
        }
      } catch (error) {
        console.error('Failed to load system config:', error)
        toast({
          title: "Lỗi tải cấu hình",
          description: "Không thể tải cấu hình hệ thống",
          variant: "destructive"
        })
        // Use default config as fallback
        setConfig(defaultConfig)
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [canManageConfig, authLoading, firebaseUser, getIdToken, toast])

  const handleConfigChange = (section: keyof SystemConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = await getIdToken()
      if (!token) {
        throw new Error('Authentication required')
      }
      
      const response = await fetch('/api/admin/system/config', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          toast({
            title: "Lưu thành công",
            description: "Cấu hình hệ thống đã được cập nhật"
          })
          setHasChanges(false)
        } else {
          throw new Error(result.error)
        }
      } else {
        throw new Error('Failed to save config')
      }
    } catch (error) {
      console.error('Save config error:', error)
      toast({
        title: "Lỗi lưu cấu hình",
        description: "Không thể lưu cấu hình hệ thống",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setConfig(defaultConfig)
    setHasChanges(true)
  }

  if (!canManageConfig) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Không có quyền truy cập</h3>
          <p className="text-gray-600">Chỉ Admin mới có quyền quản lý cấu hình hệ thống</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <BrandedLoading 
          variant="logo" 
          size="lg"
          text="Đang tải cấu hình hệ thống..."
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      
      {/* Header */}
      <div className="relative px-4 md:px-6 lg:px-8 pt-6 pb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-admin-primary-500/5 via-admin-success-500/3 to-admin-info-500/5 rounded-b-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gradient-to-br from-admin-primary-600 to-admin-success-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-admin-neutral-900 tracking-tight">
                    Cấu hình Hệ thống
                  </h1>
                  <p className="text-admin-neutral-600 mt-1">
                    Quản lý thông số và giới hạn của hệ thống
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {hasChanges && (
                <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Có thay đổi chưa lưu
                </Badge>
              )}
              
              <Button 
                variant="outline" 
                onClick={handleReset}
                disabled={saving}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              
              <Button 
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="bg-gradient-to-r from-admin-primary-600 to-admin-success-600"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 space-y-6 pb-8">
        
        {/* SLA Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Cấu hình SLA (Service Level Agreement)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="moderationTimeLimit">Thời gian kiểm duyệt tối đa (giờ)</Label>
                <Input
                  id="moderationTimeLimit"
                  type="number"
                  min="1"
                  max="168"
                  value={config.sla.moderationTimeLimit}
                  onChange={(e) => handleConfigChange('sla', 'moderationTimeLimit', parseInt(e.target.value))}
                />
                <p className="text-sm text-gray-500 mt-1">Thời gian tối đa để xử lý một địa điểm</p>
              </div>
              
              <div>
                <Label htmlFor="reportResponseTime">Thời gian phản hồi báo cáo (giờ)</Label>
                <Input
                  id="reportResponseTime"
                  type="number"
                  min="1"
                  max="72"
                  value={config.sla.reportResponseTime}
                  onChange={(e) => handleConfigChange('sla', 'reportResponseTime', parseInt(e.target.value))}
                />
                <p className="text-sm text-gray-500 mt-1">Thời gian phản hồi báo cáo từ user</p>
              </div>
              
              <div>
                <Label htmlFor="escalationTimeout">Thời gian escalation (giờ)</Label>
                <Input
                  id="escalationTimeout"
                  type="number"
                  min="1"
                  max="168"
                  value={config.sla.escalationTimeout}
                  onChange={(e) => handleConfigChange('sla', 'escalationTimeout', parseInt(e.target.value))}
                />
                <p className="text-sm text-gray-500 mt-1">Thời gian tự động escalate lên admin</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rate Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Giới hạn Người dùng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <Label htmlFor="maxDraftsPerUser">Tối đa bản nháp/user</Label>
                <Input
                  id="maxDraftsPerUser"
                  type="number"
                  min="1"
                  max="50"
                  value={config.rateLimits.maxDraftsPerUser}
                  onChange={(e) => handleConfigChange('rateLimits', 'maxDraftsPerUser', parseInt(e.target.value))}
                />
              </div>
              
              <div>
                <Label htmlFor="maxReportsPerUserPerWeek">Tối đa báo cáo/tuần</Label>
                <Input
                  id="maxReportsPerUserPerWeek"
                  type="number"
                  min="1"
                  max="20"
                  value={config.rateLimits.maxReportsPerUserPerWeek}
                  onChange={(e) => handleConfigChange('rateLimits', 'maxReportsPerUserPerWeek', parseInt(e.target.value))}
                />
              </div>
              
              <div>
                <Label htmlFor="maxCommentsPerUserPerHour">Tối đa comment/giờ</Label>
                <Input
                  id="maxCommentsPerUserPerHour"
                  type="number"
                  min="1"
                  max="100"
                  value={config.rateLimits.maxCommentsPerUserPerHour}
                  onChange={(e) => handleConfigChange('rateLimits', 'maxCommentsPerUserPerHour', parseInt(e.target.value))}
                />
              </div>
              
              <div>
                <Label htmlFor="maxSubmissionsPerDay">Tối đa submit/ngày</Label>
                <Input
                  id="maxSubmissionsPerDay"
                  type="number"
                  min="1"
                  max="10"
                  value={config.rateLimits.maxSubmissionsPerDay}
                  onChange={(e) => handleConfigChange('rateLimits', 'maxSubmissionsPerDay', parseInt(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Moderation Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Cấu hình Kiểm duyệt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label htmlFor="maxAssignedPlacesPerModerator">Tối đa địa điểm/moderator</Label>
                <Input
                  id="maxAssignedPlacesPerModerator"
                  type="number"
                  min="1"
                  max="50"
                  value={config.moderation.maxAssignedPlacesPerModerator}
                  onChange={(e) => handleConfigChange('moderation', 'maxAssignedPlacesPerModerator', parseInt(e.target.value))}
                />
                <p className="text-sm text-gray-500 mt-1">Số địa điểm tối đa một moderator có thể xử lý cùng lúc</p>
              </div>
              
              <Separator />
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoEscalationEnabled"
                  checked={config.moderation.autoEscalationEnabled}
                  onChange={(e) => handleConfigChange('moderation', 'autoEscalationEnabled', e.target.checked)}
                />
                <Label htmlFor="autoEscalationEnabled">Bật tự động escalation</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="requireSecondApproval"
                  checked={config.moderation.requireSecondApproval}
                  onChange={(e) => handleConfigChange('moderation', 'requireSecondApproval', e.target.checked)}
                />
                <Label htmlFor="requireSecondApproval">Yêu cầu phê duyệt kép</Label>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}