'use client'

import { MainLayout } from '@/components/layout/MainLayout'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { QuickActions } from '@/components/dashboard/QuickActions'

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Overview of your streaming slots and videos</p>
        </div>

        <StatsCards />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <QuickActions />
          <RecentActivity />
        </div>
      </div>
    </MainLayout>
  )
}