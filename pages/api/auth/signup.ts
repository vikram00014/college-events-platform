import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password, name, role } = req.body

  if (!email || !password || !name || !role) {
    return res.status(400).json({ 
      error: 'Email, password, name, and role are required' 
    })
  }

  if (!['student', 'organizer'].includes(role)) {
    return res.status(400).json({ 
      error: 'Invalid role. Must be either student or organizer' 
    })
  }

  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role
        }
      }
    })

    if (authError) {
      return res.status(400).json({ error: authError.message })
    }

    if (authData.user) {
      // Create user profile using any cast
      const { error: profileError } = await (supabase as any)
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          name,
          role: role as 'student' | 'organizer',
          is_active: true
        })

      if (profileError) {
        console.error('Error creating user profile:', profileError)
        // Don't return error here as auth user is already created
      }
    }

    res.status(200).json({ 
      message: 'User created successfully. Please check your email for verification.',
      user: authData.user 
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
