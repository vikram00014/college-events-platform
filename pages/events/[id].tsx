'use client'

import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Calendar, MapPin, Users, ExternalLink, ArrowLeft, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Event } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { formatDateTime, getEventStatusBadge } from '@/lib/utils'

export default function EventDetails() {
  const router = useRouter()
  const { id } = router.query
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState({ page_views: 0, registration_clicks: 0 })

  useEffect(() => {
    if (id) {
      fetchEventDetails(id as string)
      trackPageView(id as string)
    }
  }, [id])

  const fetchEventDetails = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          users:organizer_id (name, email),
          event_analytics (page_views, registration_clicks)
        `)
        .eq('id', eventId)
        .single()

      if (error) throw error
      setEvent(data)
      
      if (data.event_analytics?.[0]) {
        setAnalytics(data.event_analytics[0])
      }
    } catch (error) {
      console.error('Error fetching event details:', error)
    } finally {
      setLoading(false)
    }
  }

  const trackPageView = async (eventId: string) => {
    try {
      await fetch(`/api/events/${eventId}/track-view`, { method: 'POST' })
      
      // Update analytics in real-time
      setAnalytics(prev => ({ ...prev, page_views: prev.page_views + 1 }))
    } catch (error) {
      console.error('Error tracking page view:', error)
    }
  }

  const handleRegistrationClick = () => {
    if (event) {
      // Track registration click
      fetch(`/api/events/${event.id}/track-click`, { method: 'POST' })
        .then(() => {
          // Update analytics in real-time
          setAnalytics(prev => ({ ...prev, registration_clicks: prev.registration_clicks + 1 }))
        })
        .catch(console.error)
      
      window.open(event.registration_link, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card>
          <CardContent className="text-center p-8">
            <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The event you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusVariant = event.status === 'pending' ? 'pending' : 
                       event.status === 'approved' ? 'approved' : 
                       event.status === 'live' ? 'live' : 'archived'

  return (
    <>
      <Head>
        <title>{event.title} - College Events</title>
        <meta name="description" content={event.description.substring(0, 160)} />
        <meta property="og:title" content={event.title} />
        <meta property="og:description" content={event.description.substring(0, 160)} />
        {event.poster_url && <meta property="og:image" content={event.poster_url} />}
      </Head>

      <div className="min-h-screen gradient-bg">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Button>
            </Link>
          </div>
        </header>

        {/* Event Details */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Header */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                      {event.title}
                    </h1>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant="outline">{event.category}</Badge>
                      <Badge variant={statusVariant as any}>
                        {getEventStatusBadge(event.status, event.date_time)}
                      </Badge>
                      <span className="flex items-center text-sm text-muted-foreground">
                        <Eye className="h-4 w-4 mr-1" />
                        {analytics.page_views} views
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fixed Event Poster */}
                {event.poster_url && (
                  <div className="relative h-64 md:h-80 mb-6 rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src={event.poster_url}
                      alt={event.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                  </div>
                )}
              </div>

              {/* Event Info */}
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-primary mr-3" />
                      <div>
                        <p className="font-medium">Date & Time</p>
                        <p className="text-muted-foreground">{formatDateTime(event.date_time)}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-primary mr-3" />
                      <div>
                        <p className="font-medium">Venue</p>
                        <p className="text-muted-foreground">{event.venue}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-primary mr-3" />
                      <div>
                        <p className="font-medium">Eligibility</p>
                        <p className="text-muted-foreground">{event.eligibility}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <ExternalLink className="h-5 w-5 text-primary mr-3" />
                      <div>
                        <p className="font-medium">Registration</p>
                        <p className="text-muted-foreground">
                          {analytics.registration_clicks} clicks
                        </p>
                      </div>
                    </div>
                  </div>

                  {event.prize_details && (
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-6">
                      <h3 className="font-medium text-yellow-800 mb-2">🏆 Prizes</h3>
                      <p className="text-yellow-700">{event.prize_details}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-medium mb-3">Description</h3>
                    <div className="prose max-w-none">
                      <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Registration Card */}
              {event.status === 'approved' && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-6 text-center">
                    <h3 className="font-semibold mb-4">Ready to Join? 🎉</h3>
                    <Button 
                      onClick={handleRegistrationClick}
                      className="w-full"
                      size="lg"
                    >
                      <ExternalLink className="h-5 w-5 mr-2" />
                      Register Now
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      You'll be redirected to the registration form
                    </p>
                  </CardContent>
                </Card>
              )}

              {event.status === 'pending' && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="p-6 text-center">
                    <h3 className="font-semibold mb-2 text-orange-800">⏳ Pending Approval</h3>
                    <p className="text-sm text-orange-700">
                      This event is waiting for admin approval. Registration will be available once approved.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Contact Info */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">📞 Contact Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Organizer</p>
                      <p className="text-sm text-muted-foreground">
                        {(event as any).users?.name || 'Event Organizer'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Contact</p>
                      <p className="text-sm text-muted-foreground break-all">
                        {event.contact_info}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Share */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">🔗 Share Event</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href)
                        // You could add a toast notification here
                        alert('Link copied to clipboard!')
                      }}
                    >
                      📋 Copy Link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        const text = `Check out this event: ${event.title} - ${window.location.href}`
                        if (navigator.share) {
                          navigator.share({ title: event.title, text, url: window.location.href })
                        } else {
                          navigator.clipboard.writeText(text)
                          alert('Event details copied to clipboard!')
                        }
                      }}
                    >
                      📤 Share Event
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Analytics (for organizers/admins) */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">📊 Event Stats</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Page Views</span>
                      <span className="font-medium">{analytics.page_views}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Registration Clicks</span>
                      <span className="font-medium">{analytics.registration_clicks}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Category</span>
                      <Badge variant="outline" className="text-xs">
                        {event.category}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
