'use client'

import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EventCard } from '@/components/events/event-card'
import { AnimateOnScroll } from '@/components/ui/scroll-effects'  // ADD THIS
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
        const eventIds = (data as any).map((event: any) => event.id)
        
        const { data: analyticsData } = await supabase
          .from('event_analytics')
          .select('page_views')
          .in('event_id', eventIds)

        totalViews = (analyticsData as any)?.reduce((sum: number, analytics: any) => 
          sum + (analytics.page_views || 0), 0
        ) || 0
      }

      setStats({
        total: (data as any)?.length || 0,
        pending: (data as any)?.filter((e: any) => e.status === 'pending').length || 0,
        approved: (data as any)?.filter((e: any) => e.status === 'approved').length || 0,
        totalViews: totalViews
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
      // Use any cast to fix delete operation
      const { error } = await (supabase as any)
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
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="flex flex-col items-center space-y-4">
          <div className="pulse-loader">
            <div className="pulse-dot"></div>
            <div className="pulse-dot"></div>
            <div className="pulse-dot"></div>
          </div>
          <p className="text-muted-foreground animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Organizer Dashboard - College Events</title>
      </Head>

      <div className="min-h-screen gradient-bg">
        {/* Header - Enhanced with glass effect */}
        <header className="nav-glass border-b sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <AnimateOnScroll animation="slide-right">
                <div className="flex items-center gap-4">
                  <Link href="/">
                    <h1 className="text-2xl font-bold text-gradient">College Events</h1>
                  </Link>
                  <span className="text-muted-foreground">/ Organizer Dashboard</span>
                </div>
              </AnimateOnScroll>
              <AnimateOnScroll animation="slide-left">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {user.email}
                  </span>
                  <Button 
                    onClick={() => supabase.auth.signOut()}
                    className="btn-magnetic"
                  >
                    Sign Out
                  </Button>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Welcome Section - Enhanced with animations */}
          <div className="mb-8">
            <AnimateOnScroll animation="fade-up">
              <h2 className="heading-lg mb-2 text-shadow">Welcome back! 👋</h2>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fade-up">
              <p className="text-muted-foreground text-lg">
                Manage your events and track their performance
              </p>
            </AnimateOnScroll>
          </div>

          {/* Stats Cards - Enhanced with staggered animations */}
          <div className="stagger-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="stagger-item">
              <Card className="card-hover glass-card shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-500 animate-float" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="stagger-item">
              <Card className="card-hover glass-card shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-500 animate-float" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="stagger-item">
              <Card className="card-hover glass-card shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Approved</p>
                      <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500 animate-float" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="stagger-item">
              <Card className="card-hover glass-card shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                      <p className="text-2xl font-bold">{stats.totalViews}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-500 animate-float" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Actions - Enhanced */}
          <AnimateOnScroll animation="fade-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-shadow">Your Events</h3>
              <Link href="/organizer/create">
                <Button className="btn-pulse btn-primary shadow-glow">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Event
                </Button>
              </Link>
            </div>
          </AnimateOnScroll>

          {/* Events List - Enhanced with animations */}
          {loading ? (
            <div className="stagger-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="stagger-item">
                  <div className="skeleton rounded-xl h-80 shadow-soft"></div>
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="stagger-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event.id} className="stagger-item">
                  <EventCard
                    event={event}
                    showActions={true}
                    onEdit={(event) => router.push(`/organizer/edit/${event.id}`)}
                    onDelete={handleDeleteEvent}
                   
                  />
                </div>
              ))}
            </div>
          ) : (
            <AnimateOnScroll animation="fade-up">
              <Card className="glass-card shadow-soft max-w-md mx-auto">
                <CardContent className="text-center py-12">
                  <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4 animate-float" />
                  <h3 className="text-xl font-semibold mb-2">No events yet</h3>
                  <p className="text-muted-foreground mb-6 text-balance">
                    Create your first event to get started and reach students across campus
                  </p>
                  <Link href="/organizer/create">
                    <Button className="btn-pulse btn-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </AnimateOnScroll>
          )}
        </main>
      </div>
    </>
  )
}
