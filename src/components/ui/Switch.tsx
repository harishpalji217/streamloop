'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  description?: string
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const switchId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex items-start space-x-3">
        <div className="relative flex h-6 w-11 items-center">
          <input
            type="checkbox"
            id={switchId}
            ref={ref}
            className={cn(
              'peer appearance-none h-6 w-11 rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-gray-700',
              'checked:bg-primary-600 checked:dark:bg-primary-500'
            )}
            {...props}
          />
          <span className={cn(
            'pointer-events-none absolute left-1 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow-lg transition-transform peer-checked:translate-x-full'
          )} />
        </div>
        {(label || description) && (
          <div className="text-sm leading-5">
            {label && (
              <label htmlFor={switchId} className="font-medium text-gray-900 dark:text-white">
                {label}
              </label>
            )}
            {description && (
              <p className="text-gray-500 dark:text-gray-400">{description}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Switch.displayName = 'Switch'

export { Switch }