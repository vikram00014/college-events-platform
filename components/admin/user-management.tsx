'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { UserPlus, UserMinus, Search, Shield, User, Users } from 'lucide-react'
import { User as UserType } from '@/lib/types'
import { supabase } from '@/lib/supabase'

export function UserManagement() {
  const [users, setUsers] = useState<UserType[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
    getCurrentUser()
  }, [])

  useEffect(() => {
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [users, searchQuery])

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.email) {
        setCurrentUserEmail(user.email)
      }
    } catch (error) {
      console.error('Error getting current user:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generic function to update user role
  const updateUserRole = async (userId: string, newRole: string) => {
    setActionLoading(userId)
    try {
      const response = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          updates: { role: newRole }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update user role')
      }
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole as any } : user
      ))
      alert(`User role updated to ${newRole} successfully!`)
    } catch (error) {
      console.error('Error updating user role:', error)
      alert('Failed to update user role. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    setActionLoading(userId)
    try {
      const response = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          updates: { is_active: !currentStatus }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update user status')
      }
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_active: !currentStatus } : user
      ))
      alert(`User ${!currentStatus ? 'activated' : 'suspended'} successfully!`)
    } catch (error) {
      console.error('Error updating user status:', error)
      alert('Failed to update user status. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  // Specific role functions
  const makeAdmin = (userId: string) => updateUserRole(userId, 'admin')
  const makeOrganizer = (userId: string) => updateUserRole(userId, 'organizer')
  const makeStudent = (userId: string) => updateUserRole(userId, 'student')

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />
      case 'organizer':
        return <Users className="h-4 w-4" />
      case 'student':
        return <User className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'organizer':
        return 'default'
      case 'student':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const isCurrentUser = (userEmail: string) => {
    return userEmail === currentUserEmail
  }

  const canSuspendUser = (user: UserType) => {
    return !isCurrentUser(user.email) && user.role !== 'admin'
  }

  if (loading) {
    return (
      <Card className="glass-card shadow-soft">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-shimmer flex items-center space-x-4 p-4 border rounded">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card shadow-soft">
        <CardHeader>
          <CardTitle className="text-gradient">👥 User Management</CardTitle>
          <CardDescription>
            Manage user accounts, roles, and permissions across your platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-modern"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                <span className="text-sm font-medium">Admins: {users.filter(u => u.role === 'admin').length}</span>
              </div>
            </div>
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">Organizers: {users.filter(u => u.role === 'organizer').length}</span>
              </div>
            </div>
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Students: {users.filter(u => u.role === 'student').length}</span>
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg card-hover shadow-soft">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center animate-float">
                    {getRoleIcon(user.role)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">
                        {user.name}
                        {isCurrentUser(user.email) && (
                          <span className="text-sm text-blue-600 ml-2">(You)</span>
                        )}
                      </h4>
                      <Badge variant={getRoleBadgeVariant(user.role) as any}>
                        {user.role}
                      </Badge>
                      {!user.is_active && (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Role Change Buttons */}
                  {user.role !== 'admin' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => makeAdmin(user.id)}
                      disabled={actionLoading === user.id}
                      className="btn-magnetic"
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      Admin
                    </Button>
                  )}
                  
                  {user.role !== 'organizer' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => makeOrganizer(user.id)}
                      disabled={actionLoading === user.id}
                      className="btn-magnetic"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Organizer
                    </Button>
                  )}
                  
                  {user.role !== 'student' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => makeStudent(user.id)}
                      disabled={actionLoading === user.id}
                      className="btn-magnetic"
                    >
                      <User className="h-4 w-4 mr-1" />
                      Student
                    </Button>
                  )}
                  
                  {/* Suspend/Activate Button */}
                  {canSuspendUser(user) && (
                    <Button
                      variant={user.is_active ? "outline" : "default"}
                      size="sm"
                      onClick={() => toggleUserStatus(user.id, user.is_active)}
                      disabled={actionLoading === user.id}
                      className="btn-pulse"
                    >
                      {user.is_active ? (
                        <>
                          <UserMinus className="h-4 w-4 mr-1" />
                          Suspend
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                  )}
                  
                  {/* Protected Status */}
                  {(user.role === 'admin' || isCurrentUser(user.email)) && (
                    <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      {user.role === 'admin' ? 'Protected' : 'Current User'}
                    </span>
                  )}
                  
                  {/* Loading Indicator */}
                  {actionLoading === user.id && (
                    <div className="pulse-loader ml-2">
                      <div className="pulse-dot"></div>
                      <div className="pulse-dot"></div>
                      <div className="pulse-dot"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-float" />
              <h3 className="text-lg font-medium mb-2">No users found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try adjusting your search query' : 'No users registered yet'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
