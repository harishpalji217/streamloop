'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { User, Mail, Save, Loader2 } from 'lucide-react'

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: 'Admin User',
    email: 'admin@streamloop.local',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setLoading(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Manage your account settings</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Admin User</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">admin@streamloop.local</p>
                </div>
              </div>

              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />

              {success && (
                <div className="p-3 rounded-md bg-green-50 text-green-600 text-sm dark:bg-green-900/30 dark:text-green-400">
                  Profile updated successfully!
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button type="submit" disabled={loading} isLoading={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                <p className="font-medium text-red-800 dark:text-red-200">Delete Account</p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button variant="destructive" className="mt-3" onClick={() => alert('Account deletion not implemented in demo')}>
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}