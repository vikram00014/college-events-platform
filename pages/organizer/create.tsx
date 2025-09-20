'use client'

import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EventForm } from '@/components/events/event-form'
import { EventFormData } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface CreateEventProps {
  user: User | null
}

export default function CreateEvent({ user }: CreateEventProps) {
  const router = useRouter()

  React.useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }

    if (user.user_metadata?.role !== 'organizer') {
      router.push('/')
      return
    }
  }, [user, router])

  const handleSubmit = async (data: EventFormData) => {
  if (!user) return

  try {
    let posterUrl = null

    // Upload poster if provided
    if (data.poster) {
      const fileExt = data.poster.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('event-posters')
        .upload(fileName, data.poster)

      if (uploadError) {
        console.log('Upload error:', uploadError)
        // Continue without poster if upload fails
      } else {
        const { data: urlData } = supabase.storage
          .from('event-posters')
          .getPublicUrl(fileName)
        
        posterUrl = urlData.publicUrl
      }
    }

    // Create event
    const { data: eventData, error } = await (supabase as any)
      .from('events')
      .insert({
        title: data.title,
        description: data.description,
        category: data.category,
        date_time: data.date_time,
        venue: data.venue,
        eligibility: data.eligibility,
        contact_info: data.contact_info,
        registration_link: data.registration_link,
        prize_details: data.prize_details || null,
        poster_url: posterUrl,
        organizer_id: user.id,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    // Create analytics record
    if (eventData) {
      await (supabase as any)
        .from('event_analytics')
        .insert({
          event_id: eventData.id,
          page_views: 0,
          registration_clicks: 0
        })
    }

    alert('Event submitted successfully! It will appear after admin approval.')
    router.push('/organizer')
  } catch (error) {
    console.error('Error creating event:', error)
    alert('Error creating event. Please try again.')
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
        <title>Create Event - College Events</title>
      </Head>

      <div className="min-h-screen gradient-bg">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/organizer">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create New Event</h1>
            <p className="text-muted-foreground">
              Fill in the details below to submit your event for approval
            </p>
          </div>

          <EventForm onSubmit={handleSubmit} />
        </main>
      </div>
    </>
  )
}
