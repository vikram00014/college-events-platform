import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const isEventLive = (eventDate: string) => {
  const now = new Date()
  const eventDateTime = new Date(eventDate)
  return eventDateTime <= now
}

export const isEventUpcoming = (eventDate: string) => {
  const now = new Date()
  const eventDateTime = new Date(eventDate)
  return eventDateTime > now
}

export const getEventStatusBadge = (status: string, eventDate: string) => {
  if (status === 'pending') return 'Pending Approval'
  if (status === 'approved') {
    return isEventLive(eventDate) ? 'Live' : 'Upcoming'
  }
  if (status === 'archived') return 'Past'
  return status
}

export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const uploadImage = async (file: File) => {
  // This will be implemented when we add image upload functionality
  // For now, return a placeholder
  return { data: null, error: 'Image upload not implemented yet' }
}
