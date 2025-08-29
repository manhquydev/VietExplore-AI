"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-custom'

export default function CreateAdminPage() {
  const [email, setEmail] = useState('admin@vietexplore.test')
  const [password, setPassword] = useState('AdminTest123!')
  const [fullName, setFullName] = useState('Admin Test')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  const createAdmin = async () => {
    if (!email || !password || !fullName) {
      setResult('❌ Vui lòng điền đầy đủ thông tin')
      return
    }

    setLoading(true)
    setResult('')

    try {
      const response = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          fullName
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(`✅ ${data.message}`)
      } else {
        setResult(`❌ ${data.error}`)
      }
    } catch (error: any) {
      setResult(`❌ Lỗi: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Tạo Admin User</CardTitle>
          <p className="text-sm text-muted-foreground">
            Chỉ khả dụng trong môi trường development
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@vietexplore.test"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="AdminTest123!"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Họ tên</label>
            <Input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Admin Test"
            />
          </div>

          <Button 
            onClick={createAdmin}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Đang tạo...' : 'Tạo Admin User'}
          </Button>

          {result && (
            <div className="p-3 rounded-md bg-muted text-sm">
              {result}
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Mặc định:</strong></p>
            <p>Email: admin@vietexplore.test</p>
            <p>Password: AdminTest123!</p>
            <p>Sau khi tạo, vào <a href="/moderation/dashboard" className="underline">/moderation/dashboard</a></p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}