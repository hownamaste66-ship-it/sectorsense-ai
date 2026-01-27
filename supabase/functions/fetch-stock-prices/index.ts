import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// NSE/BSE stock symbols mapping (add .NS for NSE, .BO for BSE)
const STOCK_SYMBOL_MAP: Record<string, string> = {
  "RELIANCE": "RELIANCE.NS",
  "HDFCBANK": "HDFCBANK.NS",
  "ICICIBANK": "ICICIBANK.NS",
  "BHARTIARTL": "BHARTIARTL.NS",
  "ADANIENT": "ADANIENT.NS",
  "TITAN": "TITAN.NS",
  "LT": "LT.NS",
  "SUNPHARMA": "SUNPHARMA.NS",
  "TCS": "TCS.NS",
  "INFY": "INFY.NS",
  "WIPRO": "WIPRO.NS",
  "SBIN": "SBIN.NS",
  "HINDUNILVR": "HINDUNILVR.NS",
  "ITC": "ITC.NS",
  "KOTAKBANK": "KOTAKBANK.NS",
  "AXISBANK": "AXISBANK.NS",
  "BAJFINANCE": "BAJFINANCE.NS",
  "MARUTI": "MARUTI.NS",
  "TATAMOTORS": "TATAMOTORS.NS",
  "TATASTEEL": "TATASTEEL.NS",
  "ONGC": "ONGC.NS",
  "POWERGRID": "POWERGRID.NS",
  "NTPC": "NTPC.NS",
  "COALINDIA": "COALINDIA.NS",
  "ASIANPAINT": "ASIANPAINT.NS",
  "DRREDDY": "DRREDDY.NS",
  "CIPLA": "CIPLA.NS",
  "ULTRACEMCO": "ULTRACEMCO.NS",
  "TECHM": "TECHM.NS",
  "HCLTECH": "HCLTECH.NS",
};

interface YahooQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  averageDailyVolume3Month: number;
  marketCap: number;
  trailingPE?: number;
  trailingEps?: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
}

async function fetchYahooQuote(symbols: string[]): Promise<YahooQuote[]> {
  try {
    const symbolsStr = symbols.join(",");
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbolsStr)}`;
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Yahoo Finance API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.quoteResponse?.result || [];
  } catch (error) {
    console.error("Error fetching Yahoo quotes:", error);
    return [];
  }
}

function calculateSentiment(quote: YahooQuote): number {
  // Calculate sentiment based on multiple factors
  let score = 0.5; // Neutral baseline
  
  // Price momentum (weight: 30%)
  if (quote.regularMarketChangePercent > 3) score += 0.15;
  else if (quote.regularMarketChangePercent > 1) score += 0.08;
  else if (quote.regularMarketChangePercent > 0) score += 0.03;
  else if (quote.regularMarketChangePercent < -3) score -= 0.15;
  else if (quote.regularMarketChangePercent < -1) score -= 0.08;
  else if (quote.regularMarketChangePercent < 0) score -= 0.03;
  
  // Volume surge indicator (weight: 20%)
  const volumeRatio = quote.regularMarketVolume / (quote.averageDailyVolume3Month || 1);
  if (volumeRatio > 2) score += 0.1;
  else if (volumeRatio > 1.5) score += 0.05;
  else if (volumeRatio < 0.5) score -= 0.05;
  
  // 52-week range position (weight: 20%)
  const range = quote.fiftyTwoWeekHigh - quote.fiftyTwoWeekLow;
  const position = range > 0 ? (quote.regularMarketPrice - quote.fiftyTwoWeekLow) / range : 0.5;
  score += (position - 0.5) * 0.2;
  
  return Math.max(0, Math.min(1, score));
}

function calculateVolatility(quote: YahooQuote): number {
  // Daily volatility based on high-low range
  const dayRange = quote.regularMarketDayHigh - quote.regularMarketDayLow;
  const dayVolatility = dayRange / quote.regularMarketPrice;
  
  // 52-week volatility
  const yearRange = quote.fiftyTwoWeekHigh - quote.fiftyTwoWeekLow;
  const yearVolatility = yearRange / quote.regularMarketPrice;
  
  // Weighted average
  const volatility = (dayVolatility * 0.4 + yearVolatility * 0.6);
  return Math.max(0, Math.min(1, volatility * 2)); // Normalize to 0-1
}

function calculateRSI(changePercent: number): number {
  // Simplified RSI approximation from recent price change
  // In production, this should use historical data
  const base = 50;
  const adjustment = changePercent * 3;
  return Math.max(0, Math.min(100, base + adjustment));
}

function determineAITag(quote: YahooQuote, sentiment: number, volatility: number): string {
  const volumeRatio = quote.regularMarketVolume / (quote.averageDailyVolume3Month || 1);
  const changePercent = quote.regularMarketChangePercent;
  
  // Hot: High volume surge + positive momentum
  if (volumeRatio > 2 && changePercent > 3) return "Hot";
  
  // Strong Momentum: Consistent upward trend
  if (changePercent > 2 && sentiment > 0.7) return "Strong Momentum";
  
  // Rising: Positive but moderate
  if (changePercent > 0.5 && sentiment > 0.55) return "Rising";
  
  // Breakout: Volume surge without extreme price move
  if (volumeRatio > 1.8 && Math.abs(changePercent) > 1) return "Breakout";
  
  // Oversold: Low RSI
  const rsi = calculateRSI(changePercent);
  if (rsi < 30) return "Oversold";
  
  // Overbought: High RSI
  if (rsi > 70) return "Overbought";
  
  // High Volatility
  if (volatility > 0.7) return "High Volatility";
  
  // Watchlist: Worth watching
  if (volumeRatio > 1.3) return "Watchlist";
  
  return "Neutral";
}

function shouldBeTrending(quote: YahooQuote, sentiment: number): boolean {
  const volumeRatio = quote.regularMarketVolume / (quote.averageDailyVolume3Month || 1);
  const changePercent = Math.abs(quote.regularMarketChangePercent);
  
  // Trending if: high volume OR significant price move OR high sentiment
  return volumeRatio > 1.5 || changePercent > 2.5 || sentiment > 0.75;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting stock price fetch...");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all stocks from database
    const { data: stocks, error: stocksError } = await supabase
      .from("stocks")
      .select("id, ticker, name");

    if (stocksError) throw stocksError;
    if (!stocks || stocks.length === 0) {
      return new Response(JSON.stringify({ message: "No stocks to update" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${stocks.length} stocks to update`);

    // Map database tickers to Yahoo Finance symbols
    const yahooSymbols: string[] = [];
    const tickerToId: Record<string, string> = {};
    
    for (const stock of stocks) {
      const yahooSymbol = STOCK_SYMBOL_MAP[stock.ticker] || `${stock.ticker}.NS`;
      yahooSymbols.push(yahooSymbol);
      tickerToId[yahooSymbol] = stock.id;
    }

    // Fetch quotes in batches of 10
    const batchSize = 10;
    const updates: any[] = [];
    
    for (let i = 0; i < yahooSymbols.length; i += batchSize) {
      const batch = yahooSymbols.slice(i, i + batchSize);
      const quotes = await fetchYahooQuote(batch);
      
      for (const quote of quotes) {
        const stockId = tickerToId[quote.symbol];
        if (!stockId) continue;
        
        const sentiment = calculateSentiment(quote);
        const volatility = calculateVolatility(quote);
        const rsi = calculateRSI(quote.regularMarketChangePercent);
        const aiTag = determineAITag(quote, sentiment, volatility);
        const isTrending = shouldBeTrending(quote, sentiment);
        
        updates.push({
          id: stockId,
          price: quote.regularMarketPrice,
          price_change: quote.regularMarketChangePercent,
          volume: quote.regularMarketVolume,
          avg_volume: quote.averageDailyVolume3Month || quote.regularMarketVolume,
          market_cap: quote.marketCap,
          pe: quote.trailingPE || null,
          eps: quote.trailingEps || null,
          rsi: rsi,
          sentiment: sentiment,
          volatility: volatility,
          ai_tag: aiTag,
          is_trending: isTrending,
          updated_at: new Date().toISOString(),
        });
      }
    }

    console.log(`Prepared ${updates.length} stock updates`);

    // Update stocks in database
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from("stocks")
        .update(update)
        .eq("id", update.id);
      
      if (updateError) {
        console.error(`Error updating stock ${update.id}:`, updateError);
      }
    }

    // Update market sentiment
    const overallSentiment = updates.reduce((sum, u) => sum + u.sentiment, 0) / updates.length;
    const bullishStocks = updates.filter(u => u.price_change > 1).length;
    const bearishStocks = updates.filter(u => u.price_change < -1).length;
    
    // Calculate VIX approximation (based on average volatility)
    const avgVolatility = updates.reduce((sum, u) => sum + u.volatility, 0) / updates.length;
    const vixApprox = 10 + avgVolatility * 30; // Rough VIX approximation
    
    // Determine market mood
    let marketMood = "Neutral";
    const fearGreedScore = Math.round(overallSentiment * 100);
    
    if (fearGreedScore >= 75) marketMood = "Extreme Greed";
    else if (fearGreedScore >= 60) marketMood = "Greed";
    else if (fearGreedScore >= 55) marketMood = "Cautiously Optimistic";
    else if (fearGreedScore >= 45) marketMood = "Neutral";
    else if (fearGreedScore >= 40) marketMood = "Cautious";
    else if (fearGreedScore >= 25) marketMood = "Fear";
    else marketMood = "Extreme Fear";

    // Get bullish/bearish sectors
    const { data: industries } = await supabase.from("industries").select("name");
    const sectorNames = industries?.map(i => i.name) || [];
    
    const bullishSectors = sectorNames.slice(0, 3);
    const bearishSectors = sectorNames.slice(-2);

    const { error: sentimentError } = await supabase
      .from("market_sentiment")
      .upsert({
        date: new Date().toISOString().split('T')[0],
        vix: vixApprox,
        fear_greed_score: fearGreedScore,
        market_mood: marketMood,
        bullish_sectors: bullishSectors,
        bearish_sectors: bearishSectors,
        active_industries: sectorNames.slice(0, 4),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'date' });

    if (sentimentError) {
      console.error("Error updating market sentiment:", sentimentError);
    }

    const result = {
      success: true,
      updated: updates.length,
      timestamp: new Date().toISOString(),
      marketMood,
      fearGreedScore,
      sampleData: updates.slice(0, 3).map(u => ({
        ticker: stocks.find(s => s.id === u.id)?.ticker,
        price: u.price,
        change: u.price_change,
        sentiment: u.sentiment,
        tag: u.ai_tag,
        trending: u.is_trending,
      })),
    };

    console.log("Stock update complete:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Fetch stock prices error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
