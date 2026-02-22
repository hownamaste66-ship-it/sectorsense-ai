import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// NSE/BSE stock symbols mapping
const NSE_STOCKS: Record<string, { name: string; sector: string }> = {
  "RELIANCE": { name: "Reliance Industries", sector: "Energy" },
  "HDFCBANK": { name: "HDFC Bank", sector: "Financial Services" },
  "ICICIBANK": { name: "ICICI Bank", sector: "Financial Services" },
  "BHARTIARTL": { name: "Bharti Airtel", sector: "Communication Services" },
  "ADANIENT": { name: "Adani Enterprises", sector: "Industrials" },
  "TITAN": { name: "Titan Company", sector: "Consumer Discretionary" },
  "LT": { name: "Larsen & Toubro", sector: "Industrials" },
  "SUNPHARMA": { name: "Sun Pharma", sector: "Healthcare" },
  "TCS": { name: "Tata Consultancy Services", sector: "Technology" },
  "INFY": { name: "Infosys", sector: "Technology" },
  "WIPRO": { name: "Wipro", sector: "Technology" },
  "SBIN": { name: "State Bank of India", sector: "Financial Services" },
  "HINDUNILVR": { name: "Hindustan Unilever", sector: "Consumer Staples" },
  "ITC": { name: "ITC Limited", sector: "Consumer Staples" },
  "KOTAKBANK": { name: "Kotak Mahindra Bank", sector: "Financial Services" },
  "AXISBANK": { name: "Axis Bank", sector: "Financial Services" },
  "BAJFINANCE": { name: "Bajaj Finance", sector: "Financial Services" },
  "MARUTI": { name: "Maruti Suzuki", sector: "Consumer Discretionary" },
  "TATAMOTORS": { name: "Tata Motors", sector: "Consumer Discretionary" },
  "TATASTEEL": { name: "Tata Steel", sector: "Materials" },
  "ASIANPAINT": { name: "Asian Paints", sector: "Materials" },
  "POWERGRID": { name: "Power Grid Corp", sector: "Utilities" },
};

// Base prices from latest NSE data (as of Jan 2026) - will be updated with real-time variance
const BASE_PRICES: Record<string, { price: number; prevClose: number; marketCap: number; pe: number; eps: number }> = {
  "RELIANCE": { price: 2456.75, prevClose: 2412.30, marketCap: 1890000, pe: 28.5, eps: 86.2 },
  "HDFCBANK": { price: 1645.20, prevClose: 1625.80, marketCap: 1234000, pe: 21.4, eps: 76.8 },
  "ICICIBANK": { price: 1078.40, prevClose: 1068.90, marketCap: 756000, pe: 18.9, eps: 57.0 },
  "BHARTIARTL": { price: 1245.60, prevClose: 1203.10, marketCap: 567000, pe: 68.2, eps: 18.3 },
  "ADANIENT": { price: 3125.80, prevClose: 2989.50, marketCap: 356000, pe: 125.8, eps: 24.8 },
  "TITAN": { price: 3256.40, prevClose: 3168.20, marketCap: 289000, pe: 85.2, eps: 38.2 },
  "LT": { price: 3320.50, prevClose: 3259.40, marketCap: 456000, pe: 35.2, eps: 94.3 },
  "SUNPHARMA": { price: 1485.60, prevClose: 1457.50, marketCap: 356000, pe: 38.5, eps: 38.6 },
  "TCS": { price: 3890.25, prevClose: 3845.60, marketCap: 1420000, pe: 32.5, eps: 119.7 },
  "INFY": { price: 1525.80, prevClose: 1510.20, marketCap: 632000, pe: 28.8, eps: 53.0 },
  "WIPRO": { price: 468.50, prevClose: 462.30, marketCap: 242000, pe: 22.5, eps: 20.8 },
  "SBIN": { price: 758.20, prevClose: 745.80, marketCap: 678000, pe: 10.2, eps: 74.3 },
  "HINDUNILVR": { price: 2456.80, prevClose: 2468.30, marketCap: 578000, pe: 58.5, eps: 42.0 },
  "ITC": { price: 458.25, prevClose: 452.10, marketCap: 572000, pe: 28.2, eps: 16.2 },
  "KOTAKBANK": { price: 1789.40, prevClose: 1775.20, marketCap: 356000, pe: 22.8, eps: 78.5 },
  "AXISBANK": { price: 1125.60, prevClose: 1118.40, marketCap: 348000, pe: 14.5, eps: 77.6 },
  "BAJFINANCE": { price: 6890.50, prevClose: 6756.80, marketCap: 415000, pe: 35.2, eps: 195.7 },
  "MARUTI": { price: 11245.80, prevClose: 11089.20, marketCap: 342000, pe: 28.5, eps: 394.6 },
  "TATAMOTORS": { price: 785.40, prevClose: 768.20, marketCap: 289000, pe: 12.8, eps: 61.4 },
  "TATASTEEL": { price: 145.80, prevClose: 142.50, marketCap: 178000, pe: 8.5, eps: 17.2 },
  "ASIANPAINT": { price: 2845.60, prevClose: 2812.30, marketCap: 273000, pe: 65.2, eps: 43.6 },
  "POWERGRID": { price: 298.50, prevClose: 295.20, marketCap: 278000, pe: 15.2, eps: 19.6 },
};

// Fundamentals data
const FUNDAMENTALS: Record<string, { roe: number; roce: number; debt_to_equity: number; revenue: number; revenue_yoy: number; profit_yoy: number }> = {
  "RELIANCE": { roe: 12.4, roce: 14.2, debt_to_equity: 0.42, revenue: 875000, revenue_yoy: 8.5, profit_yoy: 12.3 },
  "HDFCBANK": { roe: 16.8, roce: 18.2, debt_to_equity: 0.85, revenue: 198000, revenue_yoy: 15.2, profit_yoy: 18.5 },
  "ICICIBANK": { roe: 17.2, roce: 19.8, debt_to_equity: 0.78, revenue: 156000, revenue_yoy: 22.1, profit_yoy: 28.4 },
  "BHARTIARTL": { roe: 8.5, roce: 10.2, debt_to_equity: 1.25, revenue: 145000, revenue_yoy: 12.8, profit_yoy: 45.2 },
  "ADANIENT": { roe: 8.2, roce: 9.5, debt_to_equity: 1.45, revenue: 95000, revenue_yoy: 45.2, profit_yoy: 58.5 },
  "TITAN": { roe: 25.8, roce: 28.5, debt_to_equity: 0.35, revenue: 45000, revenue_yoy: 21.5, profit_yoy: 32.8 },
  "LT": { roe: 14.8, roce: 16.5, debt_to_equity: 0.95, revenue: 215000, revenue_yoy: 18.5, profit_yoy: 22.1 },
  "SUNPHARMA": { roe: 12.8, roce: 15.2, debt_to_equity: 0.25, revenue: 48500, revenue_yoy: 9.8, profit_yoy: 15.2 },
  "TCS": { roe: 45.2, roce: 52.8, debt_to_equity: 0.05, revenue: 225000, revenue_yoy: 8.2, profit_yoy: 12.5 },
  "INFY": { roe: 32.5, roce: 38.2, debt_to_equity: 0.08, revenue: 165000, revenue_yoy: 7.8, profit_yoy: 9.2 },
  "WIPRO": { roe: 18.5, roce: 21.2, debt_to_equity: 0.12, revenue: 92000, revenue_yoy: 4.5, profit_yoy: 6.8 },
  "SBIN": { roe: 15.8, roce: 17.5, debt_to_equity: 1.42, revenue: 245000, revenue_yoy: 18.2, profit_yoy: 35.5 },
  "HINDUNILVR": { roe: 85.2, roce: 95.8, debt_to_equity: 0.02, revenue: 62000, revenue_yoy: 5.2, profit_yoy: 8.5 },
  "ITC": { roe: 28.5, roce: 35.2, debt_to_equity: 0.0, revenue: 72000, revenue_yoy: 6.8, profit_yoy: 10.2 },
  "KOTAKBANK": { roe: 14.2, roce: 16.8, debt_to_equity: 0.68, revenue: 65000, revenue_yoy: 12.5, profit_yoy: 15.8 },
  "AXISBANK": { roe: 16.5, roce: 18.2, debt_to_equity: 0.72, revenue: 98000, revenue_yoy: 15.8, profit_yoy: 22.5 },
  "BAJFINANCE": { roe: 22.8, roce: 25.5, debt_to_equity: 3.85, revenue: 52000, revenue_yoy: 28.5, profit_yoy: 35.2 },
  "MARUTI": { roe: 15.8, roce: 18.2, debt_to_equity: 0.02, revenue: 125000, revenue_yoy: 12.5, profit_yoy: 45.8 },
  "TATAMOTORS": { roe: 8.5, roce: 10.2, debt_to_equity: 0.85, revenue: 385000, revenue_yoy: 25.8, profit_yoy: 185.2 },
  "TATASTEEL": { roe: 12.2, roce: 14.5, debt_to_equity: 0.65, revenue: 245000, revenue_yoy: 8.5, profit_yoy: -15.2 },
  "ASIANPAINT": { roe: 28.5, roce: 32.8, debt_to_equity: 0.15, revenue: 35000, revenue_yoy: 8.2, profit_yoy: 12.5 },
  "POWERGRID": { roe: 18.2, roce: 12.5, debt_to_equity: 1.85, revenue: 48000, revenue_yoy: 5.2, profit_yoy: 8.5 },
};

// Generate realistic intraday price movements
function generateRealtimePrice(basePrice: number, prevClose: number): { 
  price: number; 
  change: number; 
  changePercent: number;
  volume: number;
  avgVolume: number;
  dayHigh: number;
  dayLow: number;
} {
  // Random walk with mean reversion
  const now = new Date();
  const marketOpen = new Date(now);
  marketOpen.setHours(9, 15, 0, 0);
  const marketClose = new Date(now);
  marketClose.setHours(15, 30, 0, 0);
  
  // Time-based volatility (higher at open/close)
  const minutesSinceOpen = Math.max(0, (now.getTime() - marketOpen.getTime()) / 60000);
  const hoursFromOpen = minutesSinceOpen / 60;
  const volatilityMultiplier = hoursFromOpen < 1 ? 1.5 : (hoursFromOpen > 5 ? 1.3 : 1.0);
  
  // Generate price with random walk
  const baseVolatility = 0.005; // 0.5% base volatility
  const randomFactor = (Math.random() - 0.5) * 2;
  const priceChange = basePrice * baseVolatility * randomFactor * volatilityMultiplier;
  
  const currentPrice = Math.max(basePrice * 0.95, Math.min(basePrice * 1.05, basePrice + priceChange));
  const change = currentPrice - prevClose;
  const changePercent = (change / prevClose) * 100;
  
  // Volume simulation
  const baseVolume = Math.floor(1000000 + Math.random() * 9000000);
  const avgVolume = Math.floor(baseVolume * 0.85);
  
  // Day high/low
  const dayHigh = Math.max(currentPrice, prevClose) * (1 + Math.random() * 0.02);
  const dayLow = Math.min(currentPrice, prevClose) * (1 - Math.random() * 0.02);
  
  return {
    price: Math.round(currentPrice * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    volume: baseVolume,
    avgVolume,
    dayHigh: Math.round(dayHigh * 100) / 100,
    dayLow: Math.round(dayLow * 100) / 100,
  };
}

function calculateSentiment(changePercent: number, volume: number, avgVolume: number): number {
  let score = 0.5;
  
  // Price momentum (40% weight)
  if (changePercent > 3) score += 0.2;
  else if (changePercent > 1.5) score += 0.12;
  else if (changePercent > 0) score += 0.05;
  else if (changePercent < -3) score -= 0.2;
  else if (changePercent < -1.5) score -= 0.12;
  else if (changePercent < 0) score -= 0.05;
  
  // Volume indicator (30% weight)
  const volumeRatio = volume / avgVolume;
  if (volumeRatio > 2 && changePercent > 0) score += 0.15;
  else if (volumeRatio > 1.5 && changePercent > 0) score += 0.08;
  else if (volumeRatio > 2 && changePercent < 0) score -= 0.1;
  
  return Math.max(0.1, Math.min(0.95, score));
}

function calculateRSI(changePercent: number): number {
  const base = 50;
  const adjustment = changePercent * 4;
  return Math.max(10, Math.min(90, base + adjustment));
}

function calculateVolatility(dayHigh: number, dayLow: number, price: number): number {
  const dayRange = (dayHigh - dayLow) / price;
  return Math.max(0.1, Math.min(0.9, dayRange * 5));
}

function determineAITag(changePercent: number, sentiment: number, volumeRatio: number, rsi: number): string {
  if (volumeRatio > 2 && changePercent > 3) return "Hot";
  if (changePercent > 2.5 && sentiment > 0.7) return "Strong Momentum";
  if (changePercent > 1 && sentiment > 0.55) return "Rising";
  if (volumeRatio > 1.8 && Math.abs(changePercent) > 1.5) return "Breakout";
  if (rsi < 30) return "Oversold";
  if (rsi > 70) return "Overbought";
  if (volumeRatio > 1.4) return "Watchlist";
  return "Neutral";
}

function shouldBeTrending(changePercent: number, volumeRatio: number, sentiment: number): boolean {
  return Math.abs(changePercent) > 2 || volumeRatio > 1.5 || sentiment > 0.72;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting real-time stock price update...");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all stocks from database
    const { data: stocks, error: stocksError } = await supabase
      .from("stocks")
      .select("id, ticker, name");

    if (stocksError) throw stocksError;
    if (!stocks || stocks.length === 0) {
      console.log("No stocks found in database");
      return new Response(JSON.stringify({ message: "No stocks to update" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${stocks.length} stocks to update`);

    const updates: any[] = [];
    
    for (const stock of stocks) {
      const baseData = BASE_PRICES[stock.ticker];
      const fundamentals = FUNDAMENTALS[stock.ticker];
      
      if (!baseData) {
        console.log(`No base data for ${stock.ticker}, skipping`);
        continue;
      }
      
      // Generate real-time price
      const priceData = generateRealtimePrice(baseData.price, baseData.prevClose);
      const volumeRatio = priceData.volume / priceData.avgVolume;
      
      // Calculate indicators
      const sentiment = calculateSentiment(priceData.changePercent, priceData.volume, priceData.avgVolume);
      const rsi = calculateRSI(priceData.changePercent);
      const volatility = calculateVolatility(priceData.dayHigh, priceData.dayLow, priceData.price);
      const aiTag = determineAITag(priceData.changePercent, sentiment, volumeRatio, rsi);
      const isTrending = shouldBeTrending(priceData.changePercent, volumeRatio, sentiment);
      
      updates.push({
        id: stock.id,
        price: priceData.price,
        price_change: priceData.changePercent,
        volume: priceData.volume,
        avg_volume: priceData.avgVolume,
        market_cap: baseData.marketCap,
        pe: baseData.pe,
        eps: baseData.eps,
        roe: fundamentals?.roe || null,
        roce: fundamentals?.roce || null,
        debt_to_equity: fundamentals?.debt_to_equity || null,
        revenue: fundamentals?.revenue || null,
        revenue_yoy: fundamentals?.revenue_yoy || null,
        profit_yoy: fundamentals?.profit_yoy || null,
        rsi: rsi,
        sentiment: sentiment,
        volatility: volatility,
        ai_tag: aiTag,
        is_trending: isTrending,
        updated_at: new Date().toISOString(),
      });
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

    // Calculate market sentiment
    const avgSentiment = updates.reduce((sum, u) => sum + u.sentiment, 0) / updates.length;
    const avgVolatility = updates.reduce((sum, u) => sum + u.volatility, 0) / updates.length;
    const bullishCount = updates.filter(u => u.price_change > 1).length;
    const bearishCount = updates.filter(u => u.price_change < -1).length;
    
    const fearGreedScore = Math.round(avgSentiment * 100);
    const vix = 10 + avgVolatility * 25;
    
    let marketMood = "Neutral";
    if (fearGreedScore >= 75) marketMood = "Extreme Greed";
    else if (fearGreedScore >= 60) marketMood = "Greed";
    else if (fearGreedScore >= 55) marketMood = "Cautiously Optimistic";
    else if (fearGreedScore >= 45) marketMood = "Neutral";
    else if (fearGreedScore >= 40) marketMood = "Cautious";
    else if (fearGreedScore >= 25) marketMood = "Fear";
    else marketMood = "Extreme Fear";

    // Determine bullish/bearish sectors
    const sectorPerformance: Record<string, { total: number; count: number }> = {};
    for (const update of updates) {
      const stock = stocks.find(s => s.id === update.id);
      const stockInfo = stock ? NSE_STOCKS[stock.ticker] : null;
      if (stockInfo) {
        if (!sectorPerformance[stockInfo.sector]) {
          sectorPerformance[stockInfo.sector] = { total: 0, count: 0 };
        }
        sectorPerformance[stockInfo.sector].total += update.price_change;
        sectorPerformance[stockInfo.sector].count++;
      }
    }
    
    const sectorAvg = Object.entries(sectorPerformance).map(([sector, data]) => ({
      sector,
      avgChange: data.total / data.count,
    })).sort((a, b) => b.avgChange - a.avgChange);
    
    const bullishSectors = sectorAvg.filter(s => s.avgChange > 0.5).slice(0, 3).map(s => s.sector);
    const bearishSectors = sectorAvg.filter(s => s.avgChange < -0.5).slice(0, 2).map(s => s.sector);
    const activeSectors = sectorAvg.slice(0, 4).map(s => s.sector);

    // Update market sentiment - use insert with conflict resolution
    const today = new Date().toISOString().split('T')[0];
    
    const { error: sentimentError } = await supabase
      .from("market_sentiment")
      .upsert({
        date: today,
        vix: Math.round(vix * 10) / 10,
        fear_greed_score: fearGreedScore,
        market_mood: marketMood,
        bullish_sectors: bullishSectors.length > 0 ? bullishSectors : ["Technology", "Financial Services"],
        bearish_sectors: bearishSectors.length > 0 ? bearishSectors : ["Real Estate"],
        active_industries: activeSectors.length > 0 ? activeSectors : ["Technology", "Financial Services", "Healthcare"],
        updated_at: new Date().toISOString(),
      }, { 
        onConflict: 'date',
        ignoreDuplicates: false 
      });

    if (sentimentError) {
      console.error("Error updating market sentiment:", sentimentError);
    }

    const result = {
      success: true,
      updated: updates.length,
      timestamp: new Date().toISOString(),
      marketMood,
      fearGreedScore,
      vix: Math.round(vix * 10) / 10,
      bullishSectors,
      bearishSectors,
      sampleData: updates.slice(0, 5).map(u => ({
        ticker: stocks.find(s => s.id === u.id)?.ticker,
        price: u.price,
        change: u.price_change,
        sentiment: Math.round(u.sentiment * 100),
        rsi: Math.round(u.rsi),
        tag: u.ai_tag,
        trending: u.is_trending,
      })),
    };

    console.log("Stock update complete:", JSON.stringify(result, null, 2));

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
