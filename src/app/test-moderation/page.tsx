"use client"

import { useState } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-custom'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function TestModerationPage() {
  const { user } = useAuth()
  const [itemId, setItemId] = useState('')
  const [reviewNotes, setReviewNotes] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testAction = async (action: 'approve' | 'reject') => {
    if (!itemId.trim()) {
      setResult({ error: 'Please enter a moderation item ID' })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      console.log(`Testing ${action} for item ${itemId}`)
      
      const response = await fetch(`/api/moderation/queue/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getIdToken()}`
        },
        body: JSON.stringify({
          action,
          reviewNotes: reviewNotes || `Test ${action} action`
        })
      })

      console.log(`Response status: ${response.status}`)
      const data = await response.json()
      console.log('Response data:', data)

      setResult({
        status: response.status,
        success: response.ok,
        data: data
      })
    } catch (error: any) {
      console.error('Error testing moderation:', error)
      setResult({
        error: error.message,
        success: false
      })
    } finally {
      setLoading(false)
    }
  }

  const testQueueFetch = async () => {
    setLoading(true)
    setResult(null)

    try {
      console.log('Testing queue fetch...')
      
      const response = await fetch('/api/moderation/queue', {
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`
        }
      })

      console.log(`Queue fetch status: ${response.status}`)
      const data = await response.json()
      console.log('Queue data:', data)

      setResult({
        status: response.status,
        success: response.ok,
        data: data,
        itemsCount: data.data?.length || 0
      })
    } catch (error: any) {
      console.error('Error fetching queue:', error)
      setResult({
        error: error.message,
        success: false
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Test Moderation Functionality</CardTitle>
            <p className="text-sm text-muted-foreground">
              Debug tool for testing approve/reject actions
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Current User:</label>
              <p className="text-sm text-muted-foreground">
                {user ? `${user.displayName || user.email} (${(user as any).role || 'unknown role'})` : 'Not logged in'}
              </p>
            </div>

            <Button onClick={testQueueFetch} disabled={loading}>
              {loading ? 'Testing...' : 'Test Queue Fetch'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Approve/Reject Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Moderation Item ID:</label>
              <Input
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                placeholder="Enter moderation queue item ID"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Get this from the moderation dashboard or browser dev tools
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Review Notes:</label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Optional review notes..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => testAction('approve')}
                disabled={loading || !itemId}
                variant="default"
              >
                {loading ? '⏳' : '✅'} Test Approve
              </Button>
              
              <Button 
                onClick={() => testAction('reject')}
                disabled={loading || !itemId}
                variant="outline"
              >
                {loading ? '⏳' : '❌'} Test Reject
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className={result.success ? 'text-green-600' : 'text-red-600'}>
                {result.success ? '✅ Success' : '❌ Error'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.status && (
                  <p><strong>Status:</strong> {result.status}</p>
                )}
                
                {result.itemsCount !== undefined && (
                  <p><strong>Queue Items:</strong> {result.itemsCount}</p>
                )}
                
                {result.error && (
                  <p className="text-red-600"><strong>Error:</strong> {result.error}</p>
                )}
                
                <div className="mt-4">
                  <strong>Full Response:</strong>
                  <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-96">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>🐛 Debug Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p><strong>Step 1:</strong> Make sure you're logged in as admin</p>
            <p><strong>Step 2:</strong> Click "Test Queue Fetch" to see if there are items</p>
            <p><strong>Step 3:</strong> Copy an item ID from the response</p>
            <p><strong>Step 4:</strong> Test approve/reject with that ID</p>
            <p><strong>Step 5:</strong> Check browser console for detailed logs</p>
            <p><strong>Step 6:</strong> Check server console for backend errors</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}