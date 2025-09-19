import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAIL = 'vikramkadam2022@gmail.com'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

  switch (req.method) {
    case 'GET':
      return handleGetUsers(req, res)
    case 'PATCH':
      return handleUpdateUser(req, res)
    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}

async function handleGetUsers(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    res.status(200).json({ users: data })
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
}

async function handleUpdateUser(req: NextApiRequest, res: NextApiResponse) {
  const { userId, updates } = req.body

  if (!userId || !updates) {
    return res.status(400).json({ error: 'User ID and updates are required' })
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error

    res.status(200).json({ user: data })
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ error: 'Failed to update user' })
  }
}
