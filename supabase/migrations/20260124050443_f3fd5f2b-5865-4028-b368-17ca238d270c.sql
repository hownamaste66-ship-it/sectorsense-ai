-- Create stocks table with extended metrics
CREATE TABLE public.stocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  ticker TEXT NOT NULL UNIQUE,
  industry_id UUID REFERENCES public.industries(id),
  market_cap NUMERIC DEFAULT 0,
  price NUMERIC DEFAULT 0,
  price_change NUMERIC DEFAULT 0,
  pe NUMERIC,
  eps NUMERIC,
  roe NUMERIC,
  roce NUMERIC,
  revenue NUMERIC,
  revenue_yoy NUMERIC,
  profit_yoy NUMERIC,
  debt_to_equity NUMERIC,
  rsi NUMERIC DEFAULT 50,
  volume NUMERIC DEFAULT 0,
  avg_volume NUMERIC DEFAULT 0,
  sentiment NUMERIC DEFAULT 0.5,
  volatility NUMERIC DEFAULT 0.5,
  ai_tag TEXT DEFAULT 'Neutral',
  is_trending BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;

-- Create policy for public read
CREATE POLICY "Stocks are publicly readable" 
ON public.stocks 
FOR SELECT 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_stocks_updated_at
BEFORE UPDATE ON public.stocks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create themes table
CREATE TABLE public.themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'sparkles',
  color TEXT DEFAULT '#4ef2db',
  stock_count INTEGER DEFAULT 0,
  performance NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

-- Create policy for public read
CREATE POLICY "Themes are publicly readable" 
ON public.themes 
FOR SELECT 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_themes_updated_at
BEFORE UPDATE ON public.themes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample stocks
INSERT INTO public.stocks (name, ticker, industry_id, market_cap, price, price_change, pe, eps, roe, roce, revenue, revenue_yoy, profit_yoy, debt_to_equity, rsi, volume, avg_volume, sentiment, volatility, ai_tag, is_trending) VALUES
('Reliance Industries', 'RELIANCE', (SELECT id FROM public.industries WHERE slug = 'energy' LIMIT 1), 1890000, 2456.75, 2.34, 28.5, 86.2, 12.4, 14.2, 875000, 8.5, 12.3, 0.42, 58, 12500000, 10000000, 0.72, 0.45, 'Strong Momentum', true),
('Tata Consultancy Services', 'TCS', (SELECT id FROM public.industries WHERE slug = 'technology' LIMIT 1), 1456000, 3890.50, -0.45, 32.1, 121.3, 48.2, 52.1, 245000, 6.2, 8.1, 0.05, 45, 3200000, 2800000, 0.65, 0.32, 'Stable', false),
('HDFC Bank', 'HDFCBANK', (SELECT id FROM public.industries WHERE slug = 'financial-services' LIMIT 1), 1234000, 1645.20, 1.23, 21.4, 76.8, 16.8, 18.2, 198000, 15.2, 18.5, 0.85, 62, 8900000, 7500000, 0.78, 0.38, 'Watchlist', true),
('Infosys', 'INFY', (SELECT id FROM public.industries WHERE slug = 'technology' LIMIT 1), 678000, 1580.30, -1.12, 26.8, 59.0, 32.1, 38.5, 156000, 4.8, 5.2, 0.08, 42, 5600000, 4800000, 0.58, 0.35, 'Neutral', false),
('ICICI Bank', 'ICICIBANK', (SELECT id FROM public.industries WHERE slug = 'financial-services' LIMIT 1), 756000, 1078.40, 0.89, 18.9, 57.0, 17.2, 19.8, 156000, 22.1, 28.4, 0.78, 55, 12000000, 9500000, 0.82, 0.42, 'Strong Momentum', true),
('Bharti Airtel', 'BHARTIARTL', (SELECT id FROM public.industries WHERE slug = 'communication-services' LIMIT 1), 567000, 1245.60, 3.45, 68.2, 18.3, 8.5, 10.2, 145000, 12.8, 45.2, 1.25, 71, 6800000, 5200000, 0.85, 0.55, 'Hot', true),
('Hindustan Unilever', 'HINDUNILVR', (SELECT id FROM public.industries WHERE slug = 'consumer-goods' LIMIT 1), 589000, 2512.80, -0.23, 58.4, 43.0, 82.5, 98.2, 62000, 2.1, 1.8, 0.12, 38, 1800000, 2100000, 0.52, 0.22, 'Cooling', false),
('Larsen & Toubro', 'LT', (SELECT id FROM public.industries WHERE slug = 'industrials' LIMIT 1), 456000, 3320.50, 1.87, 35.2, 94.3, 14.8, 16.5, 215000, 18.5, 22.1, 0.95, 64, 2400000, 2000000, 0.75, 0.48, 'Rising', true),
('Asian Paints', 'ASIANPAINT', (SELECT id FROM public.industries WHERE slug = 'materials' LIMIT 1), 298000, 3150.25, -2.15, 72.5, 43.4, 28.5, 32.1, 35000, 8.2, 6.5, 0.18, 35, 980000, 1200000, 0.48, 0.28, 'High Risk', false),
('Maruti Suzuki', 'MARUTI', (SELECT id FROM public.industries WHERE slug = 'automotive' LIMIT 1), 378000, 12450.00, 0.56, 28.9, 430.5, 15.2, 18.8, 128000, 14.2, 42.8, 0.02, 52, 450000, 520000, 0.68, 0.42, 'Watchlist', false),
('Sun Pharma', 'SUNPHARMA', (SELECT id FROM public.industries WHERE slug = 'healthcare' LIMIT 1), 356000, 1485.60, 1.92, 38.5, 38.6, 12.8, 15.2, 48500, 9.8, 15.2, 0.25, 67, 3200000, 2800000, 0.72, 0.38, 'Rising', true),
('Titan Company', 'TITAN', (SELECT id FROM public.industries WHERE slug = 'consumer-goods' LIMIT 1), 289000, 3256.40, 2.78, 85.2, 38.2, 25.8, 28.5, 45000, 21.5, 32.8, 0.35, 72, 1850000, 1500000, 0.82, 0.52, 'Hot', true),
('Power Grid Corp', 'POWERGRID', (SELECT id FROM public.industries WHERE slug = 'utilities' LIMIT 1), 245000, 285.45, 0.12, 12.8, 22.3, 18.5, 12.8, 45000, 5.2, 8.5, 1.85, 48, 18500000, 15000000, 0.62, 0.25, 'Stable', false),
('Bajaj Finance', 'BAJFINANCE', (SELECT id FROM public.industries WHERE slug = 'financial-services' LIMIT 1), 412000, 6845.20, -1.45, 42.5, 161.1, 22.5, 25.8, 52000, 28.5, 35.2, 3.25, 41, 1250000, 1100000, 0.58, 0.62, 'High Risk', false),
('Adani Enterprises', 'ADANIENT', (SELECT id FROM public.industries WHERE slug = 'industrials' LIMIT 1), 356000, 3125.80, 4.56, 125.8, 24.8, 8.2, 9.5, 95000, 45.2, 58.5, 1.45, 78, 8500000, 6000000, 0.88, 0.85, 'Hot', true);

-- Insert sample themes
INSERT INTO public.themes (name, slug, description, icon, color, stock_count, performance) VALUES
('AI & Machine Learning', 'ai-boom', 'Companies leveraging artificial intelligence and machine learning technologies', 'brain', '#6a3ff4', 45, 28.5),
('Electric Vehicles', 'ev-growth', 'Electric vehicle manufacturers and EV ecosystem companies', 'zap', '#4ef2db', 32, 35.2),
('Renewable Energy', 'renewable-energy', 'Solar, wind, and clean energy companies driving sustainability', 'sun', '#3f76ff', 28, 22.8),
('Defence & Aerospace', 'defence', 'Defense contractors and aerospace technology companies', 'shield', '#ff6b6b', 18, 18.5),
('Consumer Tech', 'consumer-tech', 'Consumer-facing technology and digital services', 'smartphone', '#ffd93d', 52, 15.2),
('Cloud & Cybersecurity', 'cloud-cyber', 'Cloud computing infrastructure and cybersecurity solutions', 'cloud', '#6bcf63', 38, 32.1),
('Pharma Innovation', 'pharma-innovation', 'Pharmaceutical R&D and biotech companies', 'pill', '#ff9f43', 25, 12.8);

-- Create market_sentiment table for dashboard
CREATE TABLE public.market_sentiment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  vix NUMERIC DEFAULT 15,
  fear_greed_score NUMERIC DEFAULT 50,
  market_mood TEXT DEFAULT 'Neutral',
  bullish_sectors TEXT[] DEFAULT '{}',
  bearish_sectors TEXT[] DEFAULT '{}',
  active_industries TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.market_sentiment ENABLE ROW LEVEL SECURITY;

-- Create policy for public read
CREATE POLICY "Market sentiment is publicly readable" 
ON public.market_sentiment 
FOR SELECT 
USING (true);

-- Insert sample market sentiment
INSERT INTO public.market_sentiment (vix, fear_greed_score, market_mood, bullish_sectors, bearish_sectors, active_industries) VALUES
(14.5, 62, 'Cautiously Optimistic', 
 ARRAY['Technology', 'Financial Services', 'Healthcare'], 
 ARRAY['Real Estate', 'Consumer Goods'],
 ARRAY['Technology', 'Financial Services', 'Energy', 'Industrials']);