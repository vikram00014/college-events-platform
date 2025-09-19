'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, MapPin, Users, Edit, Trash2, Eye, MousePointer } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Event } from '@/lib/types'
import { formatDateTime, getEventStatusBadge } from '@/lib/utils'

interface EventCardProps {
  event: Event
  showActions?: boolean
  onEdit?: (event: Event) => void
  onDelete?: (eventId: string) => void
}

export function EventCard({ event, showActions = false, onEdit, onDelete }: EventCardProps) {
  const statusVariant = event.status === 'pending' ? 'pending' : 
                       event.status === 'approved' ? 'approved' : 
                       event.status === 'live' ? 'live' : 'archived'

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onEdit?.(event)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete?.(event.id)
  }

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <Link href={`/events/${event.id}`}>
        {/* Fixed Image Section */}
        {event.poster_url && (
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={event.poster_url}
              alt={event.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {event.title}
            </CardTitle>
            <Badge variant={statusVariant as any} className="shrink-0">
              {getEventStatusBadge(event.status, event.date_time)}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {event.category}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <CardDescription className="line-clamp-3 mb-4">
            {event.description}
          </CardDescription>

          <div className="space-y-2 text-sm">
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2 shrink-0" />
              <span className="truncate">{formatDateTime(event.date_time)}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Users className="h-4 w-4 mr-2 shrink-0" />
              <span className="truncate">{event.eligibility}</span>
            </div>
          </div>

          {/* Analytics (if available) */}
          {(event as any).event_analytics?.[0] && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm text-muted-foreground">
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {(event as any).event_analytics[0].page_views} views
              </div>
              <div className="flex items-center">
                <MousePointer className="h-4 w-4 mr-1" />
                {(event as any).event_analytics[0].registration_clicks} clicks
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {showActions && (
            <div className="flex gap-2 mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  )
}
