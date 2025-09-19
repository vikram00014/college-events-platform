import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Event ID is required' })
  }

  try {
    // Check if analytics record exists
    const { data: existingAnalytics, error: fetchError } = await supabase
      .from('event_analytics')
      .select('*')
      .eq('event_id', id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    if (existingAnalytics) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('event_analytics')
        .update({
          page_views: existingAnalytics.page_views + 1,
          last_updated: new Date().toISOString()
        })
        .eq('event_id', id)

      if (updateError) throw updateError
    } else {
      // Create new analytics record
      const { error: insertError } = await supabase
        .from('event_analytics')
        .insert({
          event_id: id,
          page_views: 1,
          registration_clicks: 0,
          last_updated: new Date().toISOString()
        })

      if (insertError) throw insertError
    }

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error tracking page view:', error)
    res.status(500).json({ error: 'Failed to track page view' })
  }
}
