import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { eventId, status } = req.body

    // Use service role key to bypass RLS
    const { error } = await supabase
      .from('events')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId)

    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: 'Failed to update event' })
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
