-- Create industries table
CREATE TABLE public.industries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'building-2',
  views INTEGER NOT NULL DEFAULT 0,
  is_trending BOOLEAN NOT NULL DEFAULT false,
  sentiment_score DECIMAL(3,2) DEFAULT 0.65,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  ticker TEXT NOT NULL,
  industry_id UUID NOT NULL REFERENCES public.industries(id) ON DELETE CASCADE,
  market_cap DECIMAL(15,2) NOT NULL DEFAULT 0,
  pe_ratio DECIMAL(8,2),
  return_1y DECIMAL(6,2),
  revenue DECIMAL(15,2) NOT NULL DEFAULT 0,
  risk_score DECIMAL(3,2) DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_companies_industry ON public.companies(industry_id);
CREATE INDEX idx_industries_slug ON public.industries(slug);
CREATE INDEX idx_industries_views ON public.industries(views DESC);

-- Enable Row Level Security (public read access)
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Allow public read access to industries
CREATE POLICY "Industries are publicly readable" 
ON public.industries 
FOR SELECT 
USING (true);

-- Allow public read access to companies
CREATE POLICY "Companies are publicly readable" 
ON public.companies 
FOR SELECT 
USING (true);

-- Allow public updates to industries (for view counter)
CREATE POLICY "Industries can be updated publicly" 
ON public.industries 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_industries_updated_at
BEFORE UPDATE ON public.industries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();