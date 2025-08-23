"use client"

import { useAuth } from "@/lib/auth"
import { usePermissions } from "@/lib/auth-guards"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function AdminAuthDebugPage() {
  const { user, profile, loading, claims } = useAuth()
  const permissions = usePermissions()
  const [tokenRefreshed, setTokenRefreshed] = useState(false)

  const handleRefreshToken = async () => {
    try {
      if (user) {
        await user.getIdToken(true) // Force refresh
        setTokenRefreshed(true)
        setTimeout(() => setTokenRefreshed(false), 2000)
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Authentication Debug</h1>
          <Button 
            onClick={handleRefreshToken}
            variant={tokenRefreshed ? "default" : "outline"}
          >
            {tokenRefreshed ? "✅ Refreshed" : "🔄 Refresh Token"}
          </Button>
        </div>

        {/* User Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔒 Authentication Status
              <Badge variant={user ? "default" : "destructive"}>
                {user ? "Authenticated" : "Not Authenticated"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">UID</p>
                  <p className="font-mono text-sm">{user.uid}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email Verified</p>
                  <Badge variant={user.emailVerified ? "default" : "destructive"}>
                    {user.emailVerified ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Display Name</p>
                  <p className="text-sm">{user.displayName || "N/A"}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No user signed in</p>
            )}
          </CardContent>
        </Card>

        {/* Profile Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              👤 Profile Data
              <Badge variant={profile ? "default" : "destructive"}>
                {profile ? "Loaded" : "No Profile"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Role</p>
                  <Badge className="font-mono">{profile.role}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Verified Contributor</p>
                  <Badge variant={profile.verifiedContributor ? "default" : "secondary"}>
                    {profile.verifiedContributor ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Partner ID</p>
                  <p className="text-sm font-mono">{profile.partnerId || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Disabled</p>
                  <Badge variant={profile.disabled ? "destructive" : "default"}>
                    {profile.disabled ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No profile data available</p>
            )}
          </CardContent>
        </Card>

        {/* Claims */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏷️ Custom Claims
              <Badge variant={claims ? "default" : "destructive"}>
                {claims ? "Loaded" : "No Claims"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {claims ? (
              <div className="space-y-2">
                <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(claims, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-muted-foreground">No custom claims available</p>
            )}
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>🔐 Permissions Check</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Badge variant={permissions.isAuthenticated ? "default" : "destructive"}>
                  {permissions.isAuthenticated ? "✅" : "❌"}
                </Badge>
                <p className="text-sm mt-1">Authenticated</p>
              </div>
              <div className="text-center">
                <Badge variant={permissions.isEmailVerified ? "default" : "destructive"}>
                  {permissions.isEmailVerified ? "✅" : "❌"}
                </Badge>
                <p className="text-sm mt-1">Email Verified</p>
              </div>
              <div className="text-center">
                <Badge variant={permissions.canAccessAdmin ? "default" : "destructive"}>
                  {permissions.canAccessAdmin ? "✅" : "❌"}
                </Badge>
                <p className="text-sm mt-1">Admin Access</p>
              </div>
              <div className="text-center">
                <Badge variant={permissions.canModerate ? "default" : "destructive"}>
                  {permissions.canModerate ? "✅" : "❌"}
                </Badge>
                <p className="text-sm mt-1">Moderation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environment Info */}
        <Card>
          <CardHeader>
            <CardTitle>🌍 Environment Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Use Emulator</p>
                <Badge variant={
                  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true' ? "default" : "secondary"
                }>
                  {process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true' ? "Yes (Safe)" : "No (Production)"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Node Environment</p>
                <Badge variant="outline">
                  {process.env.NODE_ENV}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
