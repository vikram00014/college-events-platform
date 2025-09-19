-- Create users table (custom table, not auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'organizer', 'student')) NOT NULL DEFAULT 'student',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('Technical', 'Cultural', 'Sports', 'Academic', 'Competitions', 'Other')) NOT NULL,
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  venue TEXT NOT NULL,
  eligibility TEXT NOT NULL,
  contact_info TEXT NOT NULL,
  registration_link TEXT NOT NULL,
  prize_details TEXT,
  poster_url TEXT,
  organizer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'live', 'archived')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event analytics table
CREATE TABLE public.event_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE UNIQUE NOT NULL,
  page_views INTEGER DEFAULT 0,
  registration_clicks INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for event posters
INSERT INTO storage.buckets (id, name, public) 
VALUES ('event-posters', 'event-posters', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on our custom tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users 
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND (role = 'admin' OR email = 'vikramkadam2022@gmail.com')
  )
);

CREATE POLICY "Admins can update all users" ON public.users 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND (role = 'admin' OR email = 'vikramkadam2022@gmail.com')
  )
);

CREATE POLICY "Anyone can create user profile" ON public.users 
FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for events table
CREATE POLICY "Anyone can view approved events" ON public.events 
FOR SELECT USING (status = 'approved');

CREATE POLICY "Organizers can view their own events" ON public.events 
FOR SELECT USING (auth.uid() = organizer_id);

CREATE POLICY "Admins can view all events" ON public.events 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND (role = 'admin' OR email = 'vikramkadam2022@gmail.com')
  )
);

CREATE POLICY "Organizers can create events" ON public.events 
FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their own events" ON public.events 
FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "Admins can update all events" ON public.events 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND (role = 'admin' OR email = 'vikramkadam2022@gmail.com')
  )
);

CREATE POLICY "Organizers can delete their own events" ON public.events 
FOR DELETE USING (auth.uid() = organizer_id);

-- RLS Policies for event analytics
CREATE POLICY "Anyone can view analytics for approved events" ON public.event_analytics 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND status = 'approved')
);

CREATE POLICY "Organizers can view analytics for their events" ON public.event_analytics 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND organizer_id = auth.uid())
);

CREATE POLICY "Anyone can insert/update analytics" ON public.event_analytics 
FOR ALL USING (true);

-- Storage policies
CREATE POLICY "Anyone can view event posters" ON storage.objects 
FOR SELECT USING (bucket_id = 'event-posters');

CREATE POLICY "Authenticated users can upload event posters" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'event-posters' AND 
  auth.role() = 'authenticated'
);

-- Create indexes for better performance
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_date ON public.events(date_time);
CREATE INDEX idx_events_category ON public.events(category);
CREATE INDEX idx_events_organizer ON public.events(organizer_id);
CREATE INDEX idx_analytics_event ON public.event_analytics(event_id);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Trigger for events table
CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON public.events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
