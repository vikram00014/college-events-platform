'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EventFormData, EventCategory } from '@/lib/types'
import { validateUrl } from '@/lib/utils'

interface EventFormProps {
  onSubmit: (data: EventFormData) => Promise<void>
  initialData?: Partial<EventFormData>
  loading?: boolean
  title?: string
  description?: string
}

const CATEGORIES: EventCategory[] = ['Technical', 'Cultural', 'Sports', 'Academic', 'Competitions', 'Other']

export function EventForm({ 
  onSubmit, 
  initialData, 
  loading = false, 
  title = "Create New Event",
  description = "Fill in the details to create a new event" 
}: EventFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || 'Technical',
    date_time: initialData?.date_time || '',
    venue: initialData?.venue || '',
    eligibility: initialData?.eligibility || '',
    contact_info: initialData?.contact_info || '',
    registration_link: initialData?.registration_link || '',
    prize_details: initialData?.prize_details || '',
  })
  
  const [poster, setPoster] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, poster: 'File size must be less than 5MB' }))
        return
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, poster: 'Please select a valid image file' }))
        return
      }
      
      setPoster(file)
      setErrors(prev => ({ ...prev, poster: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.date_time) newErrors.date_time = 'Date and time are required'
    if (!formData.venue.trim()) newErrors.venue = 'Venue is required'
    if (!formData.eligibility.trim()) newErrors.eligibility = 'Eligibility is required'
    if (!formData.contact_info.trim()) newErrors.contact_info = 'Contact information is required'
    if (!formData.registration_link.trim()) {
      newErrors.registration_link = 'Registration link is required'
    } else if (!validateUrl(formData.registration_link)) {
      newErrors.registration_link = 'Please enter a valid URL'
    }

    // Check if event date is in the future
    const eventDate = new Date(formData.date_time)
    const now = new Date()
    if (eventDate <= now) {
      newErrors.date_time = 'Event date must be in the future'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const submitData: EventFormData = {
      ...formData,
      poster: poster || undefined
    }

    await onSubmit(submitData)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter event title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select name="category" value={formData.category} onChange={handleChange}>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="date_time">Date & Time *</Label>
              <Input
                id="date_time"
                name="date_time"
                type="datetime-local"
                value={formData.date_time}
                onChange={handleChange}
                className={errors.date_time ? 'border-red-500' : ''}
              />
              {errors.date_time && <p className="text-sm text-red-500 mt-1">{errors.date_time}</p>}
            </div>

            <div>
              <Label htmlFor="venue">Venue *</Label>
              <Input
                id="venue"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="Enter venue details"
                className={errors.venue ? 'border-red-500' : ''}
              />
              {errors.venue && <p className="text-sm text-red-500 mt-1">{errors.venue}</p>}
            </div>

            <div>
              <Label htmlFor="eligibility">Eligibility *</Label>
              <Input
                id="eligibility"
                name="eligibility"
                value={formData.eligibility}
                onChange={handleChange}
                placeholder="Who can participate?"
                className={errors.eligibility ? 'border-red-500' : ''}
              />
              {errors.eligibility && <p className="text-sm text-red-500 mt-1">{errors.eligibility}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your event..."
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_info">Contact Information *</Label>
              <Input
                id="contact_info"
                name="contact_info"
                value={formData.contact_info}
                onChange={handleChange}
                placeholder="Name - Phone Number"
                className={errors.contact_info ? 'border-red-500' : ''}
              />
              {errors.contact_info && <p className="text-sm text-red-500 mt-1">{errors.contact_info}</p>}
            </div>

            <div>
              <Label htmlFor="prize_details">Prize Details</Label>
              <Input
                id="prize_details"
                name="prize_details"
                value={formData.prize_details}
                onChange={handleChange}
                placeholder="Prize information (optional)"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="registration_link">Registration Link *</Label>
            <Input
              id="registration_link"
              name="registration_link"
              type="url"
              value={formData.registration_link}
              onChange={handleChange}
              placeholder="https://forms.gle/..."
              className={errors.registration_link ? 'border-red-500' : ''}
            />
            {errors.registration_link && <p className="text-sm text-red-500 mt-1">{errors.registration_link}</p>}
          </div>

          <div>
            <Label htmlFor="poster">Event Poster</Label>
            <Input
              id="poster"
              name="poster"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={errors.poster ? 'border-red-500' : ''}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Upload an image (max 5MB). Supported formats: JPG, PNG, GIF
            </p>
            {errors.poster && <p className="text-sm text-red-500 mt-1">{errors.poster}</p>}
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Submitting...' : 'Submit Event'}
            </Button>
            <Button type="button" variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
