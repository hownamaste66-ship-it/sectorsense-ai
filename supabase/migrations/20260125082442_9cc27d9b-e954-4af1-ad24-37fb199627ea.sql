-- Enable realtime for stocks table
ALTER PUBLICATION supabase_realtime ADD TABLE public.stocks;

-- Enable realtime for market_sentiment table  
ALTER PUBLICATION supabase_realtime ADD TABLE public.market_sentiment;