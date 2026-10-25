'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  label?: string
  showValue?: boolean
}

export function Progress({ className, value = 0, max = 100, label, showValue = false, ...props }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={cn('w-full', className)} {...props}>
      {label && (
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
          {showValue && <span className="text-gray-500 dark:text-gray-400">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full bg-primary-600 transition-all duration-300 ease-out dark:bg-primary-500"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
        />
      </div>
    </div>
  )
}