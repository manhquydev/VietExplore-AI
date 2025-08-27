"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth/auth-provider"
import { UserRoleDisplay } from "@/components/ui/role-badge"
import { MOCK_USERS, TEST_CREDENTIALS, switchToRole } from "@/lib/mock-data"
import { ChevronUp, ChevronDown, TestTube } from "lucide-react"

// Chỉ hiển thị trong development mode
export const RoleSwitcher: React.FC = () => {
  const { user, updateUser, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const handleRoleSwitch = (role: string) => {
    if (role === 'guest') {
      logout()
      return
    }
    
    const mockUser = switchToRole(role as keyof typeof TEST_CREDENTIALS)
    if (mockUser) {
      updateUser(mockUser)
      localStorage.setItem('auth_token', `mock_token_${role}_${Date.now()}`)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={`shadow-float border-primary/20 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-80"
      }`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            {isCollapsed ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(false)}
                className="p-2 h-8 w-full"
              >
                <TestTube className="h-4 w-4" />
              </Button>
            ) : (
              <>
                🧪 Role Testing
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">DEV</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCollapsed(true)}
                    className="p-1 h-6 w-6"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
              </>
            )}
          </CardTitle>
        </CardHeader>
        {!isCollapsed && (
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted mb-2">Current Role:</p>
              <div className="space-y-2">
                <UserRoleDisplay 
                  role={user?.role || "guest"}
                  variant="compact"
                />
                <p className="text-xs text-muted">{user?.fullName || "Khách vãng lai"}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted mb-2">Switch to:</p>
              <Select onValueChange={handleRoleSwitch}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Chọn role để test" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guest">Guest (Khách vãng lai)</SelectItem>
                  <SelectItem value="traveler">Traveler (Du khách)</SelectItem>
                  <SelectItem value="contributor">Contributor (Cộng tác viên)</SelectItem>
                  <SelectItem value="partner">Partner (Đối tác)</SelectItem>
                  <SelectItem value="moderator">Moderator (Kiểm duyệt)</SelectItem>
                  <SelectItem value="admin">Admin (Quản trị)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-xs space-y-1">
              <p className="font-medium">Test Features:</p>
              {user && TEST_CREDENTIALS[user.role as keyof typeof TEST_CREDENTIALS] && (
                <div className="space-y-1">
                  {TEST_CREDENTIALS[user.role as keyof typeof TEST_CREDENTIALS].features.map((feature, index) => (
                    <p key={index} className="text-muted">• {feature}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-border">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="font-medium">Quick Links:</p>
                  <div className="space-y-1">
                    <a href="/places" className="block text-primary hover:underline">Places</a>
                    <a href="/itineraries/my" className="block text-primary hover:underline">My Trips</a>
                    <a href="/contribute/new-place" className="block text-primary hover:underline">Contribute</a>
                  </div>
                </div>
                <div>
                  <p className="font-medium">Admin:</p>
                  <div className="space-y-1">
                    <a href="/moderation/dashboard" className="block text-primary hover:underline">Moderation</a>
                    <a href="/profile/me" className="block text-primary hover:underline">Profile</a>
                    <a href="/ai-assistant/chat" className="block text-primary hover:underline">AI Chat</a>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
