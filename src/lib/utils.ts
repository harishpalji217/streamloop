import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
    case 'running':
      return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
    case 'off':
    case 'stopped':
      return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800'
    case 'expired':
      return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
    case 'pending':
    case 'starting':
      return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30'
    case 'error':
      return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
    default:
      return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800'
  }
}

export function maskStreamKey(key: string): string {
  if (!key) return ''
  if (key.length <= 8) return '*'.repeat(key.length)
  return key.slice(0, 4) + '*'.repeat(key.length - 8) + key.slice(-4)
}