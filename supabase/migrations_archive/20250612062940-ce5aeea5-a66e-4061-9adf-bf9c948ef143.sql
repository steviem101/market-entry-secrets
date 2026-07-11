
-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  attendees INTEGER NOT NULL DEFAULT 0,
  organizer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add trigger to automatically update updated_at timestamp
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.events 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Enable Row Level Security (making it public for now since it's event information)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to events
CREATE POLICY "Events are publicly readable" 
  ON public.events 
  FOR SELECT 
  TO public
  USING (true);

-- Create policy to allow authenticated users to insert events
CREATE POLICY "Authenticated users can create events" 
  ON public.events 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Create policy to allow authenticated users to update events
CREATE POLICY "Authenticated users can update events" 
  ON public.events 
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Create policy to allow authenticated users to delete events
CREATE POLICY "Authenticated users can delete events" 
  ON public.events 
  FOR DELETE 
  TO authenticated
  USING (true);

-- Insert some sample events data
INSERT INTO public.events (title, description, date, time, location, type, category, attendees, organizer) VALUES
('FinTech Innovation Summit Australia', 'Australia''s premier fintech conference bringing together industry leaders, startups, and investors.', '2024-06-15', '9:00 AM - 5:00 PM', 'Sydney Convention Centre', 'Conference', 'Finance', 500, 'FinTech Australia'),
('Telecom Network Transformation Forum', 'Exploring the future of telecommunications infrastructure and 5G deployment in Australia.', '2024-06-18', '10:00 AM - 4:00 PM', 'Melbourne Exhibition Centre', 'Forum', 'Telecoms', 300, 'Telecom Industry Association'),
('Digital Banking Workshop', 'Hands-on workshop covering digital banking technologies and customer experience design.', '2024-06-20', '2:00 PM - 6:00 PM', 'Brisbane Technology Park', 'Workshop', 'Finance', 150, 'Australian Banking Association'),
('5G & IoT Innovation Showcase', 'Showcasing cutting-edge 5G applications and IoT solutions for enterprise and consumer markets.', '2024-06-22', '11:00 AM - 3:00 PM', 'Perth Convention Centre', 'Showcase', 'Telecoms', 250, 'Communications Alliance'),
('RegTech & Compliance Forum', 'Regulatory technology solutions for financial services compliance and risk management.', '2024-06-25', '9:30 AM - 4:30 PM', 'Adelaide Convention Centre', 'Forum', 'Finance', 200, 'RegTech Association'),
('Satellite Communications Conference', 'Latest developments in satellite technology and space communications infrastructure.', '2024-06-28', '8:00 AM - 6:00 PM', 'Canberra Convention Centre', 'Conference', 'Telecoms', 400, 'Space Industry Association');
