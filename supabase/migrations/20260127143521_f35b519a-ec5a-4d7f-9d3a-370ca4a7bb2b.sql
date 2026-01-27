-- Add unique constraint on date for market_sentiment table
ALTER TABLE public.market_sentiment 
ADD CONSTRAINT market_sentiment_date_unique UNIQUE (date);