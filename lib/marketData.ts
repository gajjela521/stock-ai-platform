import { MarketMoversData, StockMover } from "@/types/market";

const CACHE_DURATION_MS = 60 * 1000; // 60 seconds
let marketMoversCache: { data: MarketMoversData | null; timestamp: number } = {
    data: null,
    timestamp: 0
};

/**
 * Check if market is currently open (9:30 AM - 4:00 PM ET, Mon-Fri)
 */
function isMarketOpen(): boolean {
    const now = new Date();
    const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const day = et.getDay();
    const hour = et.getHours();
    const minute = et.getMinutes();

    // Weekend
    if (day === 0 || day === 6) return false;

    // Before 9:30 AM or after 4:00 PM
    if (hour < 9 || hour >= 16) return false;
    if (hour === 9 && minute < 30) return false;

    return true;
}

/**
 * Fetch top gainers and losers from Alpha Vantage
 */
export async function fetchMarketMovers(): Promise<MarketMoversData | null> {
    // Check cache first
    const now = Date.now();
    if (marketMoversCache.data && now - marketMoversCache.timestamp < CACHE_DURATION_MS) {
        console.log("✅ Returning cached market movers data");
        return marketMoversCache.data;
    }

    const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
        console.warn("⚠️ Alpha Vantage API key not configured");
        return null;
    }

    try {
        const url = `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${apiKey}`;

        console.log("🔄 Fetching market movers data...");
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: MarketMoversData = await response.json();

        // Check for errors
        if ('Note' in data) {
            console.warn("⚠️ Alpha Vantage rate limit hit");
            // Return cached data if available
            return marketMoversCache.data;
        }

        // Update cache
        marketMoversCache = {
            data,
            timestamp: now
        };

        console.log("✅ Market movers data fetched successfully");
        return data;
    } catch (error) {
        console.error("❌ Error fetching market movers:", error);
        // Return cached data if available
        return marketMoversCache.data;
    }
}

/**
 * Get top N gainers
 */
export async function fetchTopGainers(limit: number = 10): Promise<StockMover[]> {
    const data = await fetchMarketMovers();
    if (!data || !data.top_gainers) return [];
    return data.top_gainers.slice(0, limit);
}

/**
 * Get top N losers
 */
export async function fetchTopLosers(limit: number = 10): Promise<StockMover[]> {
    const data = await fetchMarketMovers();
    if (!data || !data.top_losers) return [];
    return data.top_losers.slice(0, limit);
}
