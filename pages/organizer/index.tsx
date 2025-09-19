'use client'

import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EventCard } from '@/components/events/event-card'
import { Plus, Calendar, Clock, CheckCircle, BarChart3 } from 'lucide-react'
import { Event } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface OrganizerDashboardProps {
  user: User | null
}

export default function OrganizerDashboard({ user }: OrganizerDashboardProps) {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    totalViews: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }

    if (user.user_metadata?.role !== 'organizer') {
      router.push('/')
      return
    }

    fetchOrganizerEvents()
  }, [user, router])

  const fetchOrganizerEvents = async () => {
    if (!user) return

    try {
      // Fetch events first
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setEvents(data || [])

      // Fetch total views separately
      let totalViews = 0
      if (data && data.length > 0) {
        const eventIds = data.map(event => event.id)
        
        const { data: analyticsData } = await supabase
          .from('event_analytics')
          .select('page_views')
          .in('event_id', eventIds)

        totalViews = analyticsData?.reduce((sum, analytics) => 
          sum + (analytics.page_views || 0), 0
        ) || 0
      }

      setStats({
        total: data?.length || 0,
        pending: data?.filter(e => e.status === 'pending').length || 0,
        approved: data?.filter(e => e.status === 'approved').length || 0,
        totalViews: totalViews // Now properly calculated!
      })
    } catch (error) {
      console.error('Error fetching organizer events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (error) throw error
      
      setEvents(prev => prev.filter(e => e.id !== eventId))
      
      // Update stats after deletion
      setStats(prev => ({
        ...prev,
        total: prev.total - 1,
        pending: events.filter(e => e.id !== eventId && e.status === 'pending').length,
        approved: events.filter(e => e.id !== eventId && e.status === 'approved').length
      }))
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  if (!user || user.user_metadata?.role !== 'organizer') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Organizer Dashboard - College Events</title>
      </Head>

      <div className="min-h-screen gradient-bg">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <h1 className="text-2xl font-bold text-gradient">College Events</h1>
                </Link>
                <span className="text-muted-foreground">/ Organizer Dashboard</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                <Button onClick={() => supabase.auth.signOut()}>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
            <p className="text-muted-foreground">
              Manage your events and track their performance
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                    <p className="text-2xl font-bold">{stats.totalViews}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Your Events</h3>
            <Link href="/organizer/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Event
              </Button>
            </Link>
          </div>

          {/* Events List */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-xl h-80"></div>
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  showActions={true}
                  onEdit={(event) => router.push(`/organizer/edit/${event.id}`)}
                  onDelete={handleDeleteEvent}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No events yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first event to get started
                </p>
                <Link href="/organizer/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </>
  )
}
