'use client'

import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { LoginForm } from '@/components/auth/login-form'
import { SignUpForm } from '@/components/auth/signup-form'
import { User } from '@supabase/supabase-js'

interface AuthProps {
  user: User | null
}

export default function Auth({ user }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const role = user.user_metadata?.role
      if (role === 'admin') {
        router.push('/admin')
      } else if (role === 'organizer') {
        router.push('/organizer')
      } else {
        router.push('/')
      }
    }
  }, [user, router])

  // Don't render if user is logged in
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{isLogin ? 'Sign In' : 'Sign Up'} - College Events</title>
      </Head>

      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gradient mb-2">
              College Events
            </h1>
            <p className="text-muted-foreground">
              {isLogin 
                ? 'Welcome back! Sign in to your account' 
                : 'Create an account to get started'
              }
            </p>
          </div>

          {isLogin ? (
            <LoginForm onToggleForm={() => setIsLogin(false)} />
          ) : (
            <SignUpForm onToggleForm={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </>
  )
}
