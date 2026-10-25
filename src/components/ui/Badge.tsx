'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'border-transparent bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 hover:bg-primary-100/80',
    secondary: 'border-transparent bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-100/80',
    destructive: 'border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-100/80',
    outline: 'text-foreground',
    success: 'border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-100/80',
    warning: 'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 hover:bg-yellow-100/80',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }