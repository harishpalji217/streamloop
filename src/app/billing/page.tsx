'use client'

import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CreditCard, AlertCircle } from 'lucide-react'

export default function BillingPage() {
  return (
    <MainLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Manage your subscription and billing information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Free Tier</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Basic streaming features</p>
              </div>
              <Badge variant="outline" className="text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400">
                Active
              </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">∞</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Streaming Slots</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">∞</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Video Storage</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">24/7</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Stream Duration</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: 'Unlimited streaming slots', included: true },
              { name: 'Unlimited video uploads', included: true },
              { name: '24/7 continuous streaming', included: true },
              { name: 'Loop video playback', included: true },
              { name: 'Schedule streams', included: true },
              { name: 'Custom RTMP endpoints', included: true },
              { name: 'Stream analytics', included: false },
              { name: 'Priority support', included: false },
            ].map((feature) => (
              <div key={feature.name} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-gray-700 dark:text-gray-300">{feature.name}</span>
                <Badge variant={feature.included ? 'success' : 'outline'}>
                  {feature.included ? 'Included' : 'Pro'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">Local Development Notice</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                This is a local development version. Billing integration with Stripe or other payment providers
                would be implemented in a production deployment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}