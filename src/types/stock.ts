export interface Stock {
  id: string;
  name: string;
  ticker: string;
  industry_id: string | null;
  market_cap: number;
  price: number;
  price_change: number;
  pe: number | null;
  eps: number | null;
  roe: number | null;
  roce: number | null;
  revenue: number | null;
  revenue_yoy: number | null;
  profit_yoy: number | null;
  debt_to_equity: number | null;
  rsi: number;
  volume: number;
  avg_volume: number;
  sentiment: number;
  volatility: number;
  ai_tag: string;
  is_trending: boolean;
  created_at: string;
  updated_at: string;
}

export interface Theme {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  stock_count: number;
  performance: number;
  created_at: string;
  updated_at: string;
}

export interface MarketSentiment {
  id: string;
  date: string;
  vix: number;
  fear_greed_score: number;
  market_mood: string;
  bullish_sectors: string[];
  bearish_sectors: string[];
  active_industries: string[];
  created_at: string;
  updated_at: string;
}

export type ScannerFilter = 
  | 'high-growth'
  | 'low-debt'
  | 'breakout'
  | 'oversold'
  | 'overbought'
  | 'volume-surge'
  | 'strong-momentum'
  | 'undervalued';

export interface StockPrediction {
  trend: 'Bullish' | 'Bearish' | 'Neutral';
  momentum_score: number;
  support_level: number;
  resistance_level: number;
  industry_sentiment_impact: number;
  volatility_score: number;
  seven_day_forecast: {
    direction: 'up' | 'down' | 'sideways';
    probability: number;
  };
  long_term_zones: {
    support: number;
    resistance: number;
    target: number;
  };
}