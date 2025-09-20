import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId, updates } = req.body

    if (!userId || !updates) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // FIXED: Remove updated_at since users table doesn't have it
    const { error } = await (supabase as any)
      .from('users')
      .update(updates)
      .eq('id', userId)

    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: 'Failed to update user', details: error.message })
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
