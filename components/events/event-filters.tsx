'use client'

import React from 'react'
import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { EventCategory, EventStatus } from '@/lib/types'

interface EventFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  categoryFilter: EventCategory | 'all'
  onCategoryChange: (category: EventCategory | 'all') => void
  statusFilter: EventStatus | 'all'
  onStatusChange: (status: EventStatus | 'all') => void
  onReset: () => void
}

const CATEGORIES: (EventCategory | 'all')[] = ['all', 'Technical', 'Cultural', 'Sports', 'Academic', 'Competitions', 'Other']
const STATUS_OPTIONS: (EventStatus | 'all')[] = ['all', 'pending', 'approved', 'live', 'archived']

export function EventFilters({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  onReset
}: EventFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="min-w-[140px]">
            <Select 
              value={categoryFilter} 
              onChange={(e) => onCategoryChange(e.target.value as EventCategory | 'all')}
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </Select>
          </div>
          
          <div className="min-w-[120px]">
            <Select 
              value={statusFilter} 
              onChange={(e) => onStatusChange(e.target.value as EventStatus | 'all')}
            >
              {STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : 
                   status === 'pending' ? 'Pending' :
                   status === 'approved' ? 'Upcoming' :
                   status === 'live' ? 'Live' : 'Past'}
                </option>
              ))}
            </Select>
          </div>
          
          <Button variant="outline" onClick={onReset} size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}
