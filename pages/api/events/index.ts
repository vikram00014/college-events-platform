import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      return handleGetEvents(req, res)
    case 'POST':
      return handleCreateEvent(req, res)
    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}

async function handleGetEvents(req: NextApiRequest, res: NextApiResponse) {
  const { 
    status, 
    category, 
    organizer_id, 
    search,
    limit = '50',
    offset = '0' 
  } = req.query

  try {
    let query = supabase
      .from('events')
      .select(`
        *,
        users:organizer_id (name, email),
        event_analytics (page_views, registration_clicks)
      `)

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (organizer_id) {
      query = query.eq('organizer_id', organizer_id)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,venue.ilike.%${search}%`)
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1)

    const { data, error } = await query

    if (error) throw error

    res.status(200).json({ events: data })
  } catch (error) {
    console.error('Error fetching events:', error)
    res.status(500).json({ error: 'Failed to fetch events' })
  }
}

async function handleCreateEvent(req: NextApiRequest, res: NextApiResponse) {
  // Verify user authentication
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization required' })
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)

  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid authorization' })
  }

  if (user.user_metadata?.role !== 'organizer') {
    return res.status(403).json({ error: 'Organizer access required' })
  }

  const eventData = req.body

  if (!eventData.title || !eventData.description || !eventData.date_time || !eventData.venue) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // Create event using any cast
    const { data, error } = await (supabase as any)
      .from('events')
      .insert({
        ...eventData,
        organizer_id: user.id,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // Create analytics record using any cast
    await (supabase as any)
      .from('event_analytics')
      .insert({
        event_id: data.id,
        page_views: 0,
        registration_clicks: 0
      })

    res.status(201).json({ event: data })
  } catch (error) {
    console.error('Error creating event:', error)
    res.status(500).json({ error: 'Failed to create event' })
  }
}
