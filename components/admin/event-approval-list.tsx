'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Eye, Calendar, MapPin, Users } from 'lucide-react'
import { Event } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { formatDateTime } from '@/lib/utils'

export function EventApprovalList() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchPendingEvents()
  }, [])

  const fetchPendingEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          users:organizer_id (name, email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching pending events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (eventId: string, status: 'approved' | 'rejected') => {
    setActionLoading(eventId)
    try {
      // Use API route instead of direct Supabase update
      const response = await fetch('/api/admin/update-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: eventId,
          status: status === 'approved' ? 'approved' : 'rejected'
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${status} event`)
      }
      
      // Remove from list after approval/rejection
      setEvents(prev => prev.filter(e => e.id !== eventId))
      alert(`Event ${status} successfully!`)
    } catch (error) {
      console.error('Error updating event status:', error)
      alert(`Failed to ${status} event. Please try again.`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleBulkApproval = async (status: 'approved' | 'rejected') => {
    if (selectedEvents.size === 0) return

    setActionLoading('bulk')
    try {
      // Update each event individually using API
      const promises = Array.from(selectedEvents).map(eventId =>
        fetch('/api/admin/update-event', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventId: eventId,
            status: status === 'approved' ? 'approved' : 'rejected'
          }),
        })
      )

      const results = await Promise.all(promises)
      
      // Check if all requests were successful
      const allSuccessful = results.every(response => response.ok)
      
      if (!allSuccessful) {
        throw new Error('Some events failed to update')
      }
      
      // Remove approved/rejected events from list
      setEvents(prev => prev.filter(e => !selectedEvents.has(e.id)))
      setSelectedEvents(new Set())
      alert(`All selected events ${status} successfully!`)
    } catch (error) {
      console.error('Error bulk updating events:', error)
      alert(`Failed to bulk ${status} events. Please try again.`)
    } finally {
      setActionLoading(null)
    }
  }

  const toggleEventSelection = (eventId: string) => {
    setSelectedEvents(prev => {
      const newSet = new Set(prev)
      if (newSet.has(eventId)) {
        newSet.delete(eventId)
      } else {
        newSet.add(eventId)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (selectedEvents.size === events.length) {
      setSelectedEvents(new Set())
    } else {
      setSelectedEvents(new Set(events.map(e => e.id)))
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse border rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedEvents.size > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {selectedEvents.size} event{selectedEvents.size > 1 ? 's' : ''} selected
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleBulkApproval('approved')}
                  disabled={actionLoading === 'bulk'}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkApproval('rejected')}
                  disabled={actionLoading === 'bulk'}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pending Approvals ({events.length})</CardTitle>
            {events.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
              >
                {selectedEvents.size === events.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedEvents.has(event.id)}
                      onChange={() => toggleEventSelection(event.id)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-lg">{event.title}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <Badge variant="outline">{event.category}</Badge>
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDateTime(event.date_time)}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {event.venue}
                            </span>
                            <span className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {event.eligibility}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="font-medium">Organizer:</span>{' '}
                          {(event as any).users?.name} ({(event as any).users?.email})
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/events/${event.id}`, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApproval(event.id, 'approved')}
                            disabled={actionLoading === event.id}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {actionLoading === event.id ? 'Processing...' : 'Approve'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproval(event.id, 'rejected')}
                            disabled={actionLoading === event.id}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">All caught up!</h3>
              <p className="text-muted-foreground">No events pending approval at the moment.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
