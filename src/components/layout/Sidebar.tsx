'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Radio,
  Video,
  CreditCard,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Live Slots', href: '/live-slots', icon: Radio },
  { name: 'Videos', href: '/videos', icon: Video },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Profile', href: '/profile', icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-700 dark:bg-gray-900',
        collapsed ? 'w-16' : 'w-64'
      )}
      aria-label="Main navigation"
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className={cn('flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700', collapsed && 'justify-center')}>
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Radio className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <span className="font-bold text-xl text-gray-900 dark:text-white">StreamLoop</span>
            </Link>
          )}
          {collapsed && (
            <Link href="/dashboard" className="p-2" aria-label="StreamLoop">
              <Radio className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white',
              collapsed && 'mx-auto'
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4" aria-label="Main navigation">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white',
                  collapsed && 'justify-center'
                )}
                aria-current={isActive ? 'page' : undefined}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className={cn('p-4 border-t border-gray-200 dark:border-gray-700', collapsed && 'hidden')}>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Admin User</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">admin@streamloop.local</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}