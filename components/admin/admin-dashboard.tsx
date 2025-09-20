'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Users, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react'
import { Event } from '@/lib/types'
import { supabase } from '@/lib/supabase'

interface DashboardStats {
  totalEvents: number
  pendingApprovals: number
  liveEvents: number
  totalOrganizers: number
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    pendingApprovals: 0,
    liveEvents: 0,
    totalOrganizers: 0
  })
  const [recentEvents, setRecentEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch events statistics with proper typing
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (eventsError) {
        console.error('Error fetching events:', eventsError)
        return
      }
      
      // Fetch users statistics with proper typing
      const { data: organizersData, error: organizersError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'organizer')

      if (organizersError) {
        console.error('Error fetching organizers:', organizersError)
        return
      }

      // Type assertion to ensure proper typing
      const events = (eventsData as Event[]) || []
      const organizers = organizersData || []

      if (events && organizers) {
        setStats({
          totalEvents: events.length,
          pendingApprovals: events.filter(e => e.status === 'pending').length,
          liveEvents: events.filter(e => e.status === 'approved' && new Date(e.date_time) <= new Date()).length,
          totalOrganizers: organizers.length
        })
        
        setRecentEvents(events.slice(0, 5))
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set default stats on error to prevent crashes
      setStats({
        totalEvents: 0,
        pendingApprovals: 0,
        liveEvents: 0,
        totalOrganizers: 0
      })
      setRecentEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (eventId: string) => {
    try {
      // Use SQL query instead of update to bypass TypeScript issues
      const { error } = await supabase.rpc('approve_event', { event_id: eventId })

      if (error) {
        console.error('RPC call failed, using direct update:', error)
        // Fallback to direct SQL update
        const { error: updateError } = await supabase
          .from('events')
          .update({ status: 'approved' } as any)
          .eq('id', eventId)
        
        if (updateError) throw updateError
      }

      // Refresh dashboard data
      fetchDashboardData()
    } catch (error) {
      console.error('Error approving event:', error)
    }
  }

  const handleReject = async (eventId: string) => {
    try {
      // Use SQL query instead of update to bypass TypeScript issues
      const { error } = await supabase.rpc('reject_event', { event_id: eventId })

      if (error) {
        console.error('RPC call failed, using direct update:', error)
        // Fallback to direct SQL update
        const { error: updateError } = await supabase
          .from('events')
          .update({ status: 'rejected' } as any)
          .eq('id', eventId)
        
        if (updateError) throw updateError
      }

      // Refresh dashboard data
      fetchDashboardData()
    } catch (error) {
      console.error('Error rejecting event:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{stats.totalEvents}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Live Events</p>
                <p className="text-2xl font-bold text-green-600">{stats.liveEvents}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Organizers</p>
                <p className="text-2xl font-bold">{stats.totalOrganizers}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>Latest events submitted for approval</CardDescription>
        </CardHeader>
        <CardContent>
          {recentEvents.length > 0 ? (
            <div className="space-y-4">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {event.category} • {new Date(event.date_time).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={
                        event.status === 'pending' ? 'pending' as any :
                        event.status === 'approved' ? 'approved' as any :
                        event.status === 'rejected' ? 'destructive' as any :
                        event.status === 'archived' ? 'secondary' as any : 'default' as any
                      }
                    >
                      {event.status}
                    </Badge>
                    {event.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="h-8"
                          onClick={() => handleApprove(event.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8"
                          onClick={() => handleReject(event.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No recent events</h3>
              <p className="text-muted-foreground">
                Events will appear here once organizers start creating them
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
