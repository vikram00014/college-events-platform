'use client'

import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EventCard } from '@/components/events/event-card'
import { EventFilters } from '@/components/events/event-filters'
import { CalendarDays, Users, TrendingUp, Plus } from 'lucide-react'
import { Event, EventCategory, EventStatus } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface HomeProps {
  user: User | null
}

export default function Home({ user }: HomeProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all')

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    let filtered = events

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(event => event.category === categoryFilter)
    }

    // Status filter - only show approved events for public
    if (statusFilter === 'all') {
      filtered = filtered.filter(event => event.status === 'approved')
    } else if (statusFilter === 'live') {
      filtered = filtered.filter(event => 
        event.status === 'approved' && new Date(event.date_time) <= new Date()
      )
    } else if (statusFilter === 'approved') {
      filtered = filtered.filter(event => 
        event.status === 'approved' && new Date(event.date_time) > new Date()
      )
    }

    setFilteredEvents(filtered)
  }, [events, searchQuery, categoryFilter, statusFilter])

  const fetchEvents = async () => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'approved')
      .order('date_time', { ascending: true })

    if (error) throw error
    setEvents(data || [])
  } catch (error) {
    console.error('Error fetching events:', error)
  } finally {
    setLoading(false)
  }
}


  const resetFilters = () => {
    setSearchQuery('')
    setCategoryFilter('all')
    setStatusFilter('all')
  }

  const upcomingEvents = filteredEvents.filter(event => new Date(event.date_time) > new Date())
  const liveEvents = filteredEvents.filter(event => new Date(event.date_time) <= new Date())

  return (
    <>
      <Head>
        <title>College Events Platform</title>
        <meta name="description" content="Discover and register for college events" />
      </Head>

      <div className="min-h-screen gradient-bg">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gradient">
                College Events
              </h1>
              <div className="flex items-center gap-4">
                {user ? (
                  <>
                    <span className="text-sm text-muted-foreground">
                      Welcome, {user.email}
                    </span>
                    {user.user_metadata?.role === 'organizer' && (
                      <Link href="/organizer">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Event
                        </Button>
                      </Link>
                    )}
                    {user.user_metadata?.role === 'admin' && (
                      <Link href="/admin">
                        <Button variant="outline">Admin Panel</Button>
                      </Link>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={() => supabase.auth.signOut()}
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <Link href="/auth">
                      <Button variant="outline">Sign In</Button>
                    </Link>
                    <Link href="/auth">
                      <Button>Get Started</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Amazing <span className="text-gradient">Events</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Stay updated with all college events, competitions, and activities. 
              Never miss an opportunity to learn, compete, and grow.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-2 text-lg">
                <CalendarDays className="h-6 w-6 text-primary" />
                <span>{events.length} Events</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
                <span>{liveEvents.length} Live Now</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-lg">
                <Users className="h-6 w-6 text-primary" />
                <span>{upcomingEvents.length} Upcoming</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="pb-8">
          <div className="container mx-auto px-4">
            <EventFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              onReset={resetFilters}
            />
          </div>
        </section>

        {/* Events Grid */}
        <section className="pb-16">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-white rounded-xl h-80"></div>
                  </div>
                ))}
              </div>
            ) : filteredEvents.length > 0 ? (
              <>
                {/* Live Events */}
                {liveEvents.length > 0 && (
                  <div className="mb-12">
                    <h3 className="text-2xl font-bold mb-6 flex items-center">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></span>
                      Live Events
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {liveEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Upcoming Events */}
                {upcomingEvents.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold mb-6">Upcoming Events</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {upcomingEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <CalendarDays className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-2xl font-bold mb-2">No events found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'No events are currently available'}
                </p>
                {(searchQuery || categoryFilter !== 'all' || statusFilter !== 'all') && (
                  <Button onClick={resetFilters}>Clear Filters</Button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <p className="text-muted-foreground">
                © Vikram Kadam. Built with ❤️ for students.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
/ /   B u i l d   t r i g g e r  
 