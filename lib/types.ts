export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'organizer' | 'student'
          name: string
          created_at: string
          is_active: boolean
        }
        Insert: {
          id: string
          email: string
          role: 'admin' | 'organizer' | 'student'
          name: string
          created_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'organizer' | 'student'
          name?: string
          created_at?: string
          is_active?: boolean
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          category: 'Technical' | 'Cultural' | 'Sports' | 'Academic' | 'Competitions' | 'Other'
          date_time: string
          venue: string
          eligibility: string
          contact_info: string
          registration_link: string
          prize_details?: string
          poster_url?: string
          organizer_id: string
          status: 'pending' | 'approved' | 'live' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: 'Technical' | 'Cultural' | 'Sports' | 'Academic' | 'Competitions' | 'Other'
          date_time: string
          venue: string
          eligibility: string
          contact_info: string
          registration_link: string
          prize_details?: string
          poster_url?: string
          organizer_id: string
          status?: 'pending' | 'approved' | 'live' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: 'Technical' | 'Cultural' | 'Sports' | 'Academic' | 'Competitions' | 'Other'
          date_time?: string
          venue?: string
          eligibility?: string
          contact_info?: string
          registration_link?: string
          prize_details?: string
          poster_url?: string
          organizer_id?: string
          status?: 'pending' | 'approved' | 'live' | 'archived'
          created_at?: string
          updated_at?: string
        }
      }
      event_analytics: {
        Row: {
          id: string
          event_id: string
          page_views: number
          registration_clicks: number
          last_updated: string
        }
        Insert: {
          id?: string
          event_id: string
          page_views?: number
          registration_clicks?: number
          last_updated?: string
        }
        Update: {
          id?: string
          event_id?: string
          page_views?: number
          registration_clicks?: number
          last_updated?: string
        }
      }
    }
  }
}

export type User = Database['public']['Tables']['users']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type EventAnalytics = Database['public']['Tables']['event_analytics']['Row']

export type EventStatus = 'pending' | 'approved' | 'live' | 'archived'
export type EventCategory = 'Technical' | 'Cultural' | 'Sports' | 'Academic' | 'Competitions' | 'Other'
export type UserRole = 'admin' | 'organizer' | 'student'

export interface EventFormData {
  title: string
  description: string
  category: EventCategory
  date_time: string
  venue: string
  eligibility: string
  contact_info: string
  registration_link: string
  prize_details?: string
  poster?: File
}
