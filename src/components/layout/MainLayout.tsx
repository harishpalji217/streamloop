'use client'

import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
      <Sidebar />
      <main className="transition-all duration-300 lg:ml-64">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}