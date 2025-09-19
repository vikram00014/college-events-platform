'use client'

import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { EventApprovalList } from '@/components/admin/event-approval-list'
import { UserManagement } from '@/components/admin/user-management'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface AdminPanelProps {
  user: User | null
}

const ADMIN_EMAIL = 'vikramkadam2022@gmail.com'

export default function AdminPanel({ user }: AdminPanelProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }

    // Check if user is admin
    if (user.email !== ADMIN_EMAIL && user.user_metadata?.role !== 'admin') {
      router.push('/')
      return
    }
  }, [user, router])

  if (!user || (user.email !== ADMIN_EMAIL && user.user_metadata?.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Admin Panel - College Events</title>
      </Head>

      <div className="min-h-screen gradient-bg">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <h1 className="text-2xl font-bold text-gradient">College Events</h1>
                </Link>
                <span className="text-muted-foreground">/ Admin Panel</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Admin: {user.email}
                </span>
                <Link href="/">
                  <Button variant="outline">View Site</Button>
                </Link>
                <Button onClick={() => supabase.auth.signOut()}>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
            <p className="text-muted-foreground">
              Manage events, users, and platform settings
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="approvals">Event Approvals</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <AdminDashboard />
            </TabsContent>

            <TabsContent value="approvals">
              <EventApprovalList />
            </TabsContent>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  )
}
