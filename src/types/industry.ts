export interface Industry {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  views: number;
  is_trending: boolean;
  sentiment_score: number;
  created_at: string;
  updated_at: string;
  company_count?: number;
}

export interface Company {
  id: string;
  name: string;
  ticker: string;
  industry_id: string;
  market_cap: number;
  pe_ratio: number | null;
  return_1y: number | null;
  revenue: number;
  risk_score: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type FilterType = 'all' | 'trending' | 'high-growth' | 'low-risk' | 'tech' | 'non-tech';
