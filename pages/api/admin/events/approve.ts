import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAIL = 'vikramkadam2022@gmail.com'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify admin access
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization required' })
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)

  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid authorization' })
  }

  if (user.email !== ADMIN_EMAIL && user.user_metadata?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }

  const { eventIds, action } = req.body

  if (!eventIds || !Array.isArray(eventIds) || eventIds.length === 0) {
    return res.status(400).json({ error: 'Event IDs are required' })
  }

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action' })
  }

  try {
    const newStatus = action === 'approve' ? 'approved' : 'archived'
    
    const { data, error } = await supabase
      .from('events')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .in('id', eventIds)
      .select()

    if (error) throw error

    res.status(200).json({ 
      message: `Successfully ${action}d ${eventIds.length} event(s)`,
      events: data 
    })
  } catch (error) {
    console.error(`Error ${action}ing events:`, error)
    res.status(500).json({ error: `Failed to ${action} events` })
  }
}
