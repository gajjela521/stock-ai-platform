import {
    FullAnalysis,
    MarketStatus,
} from "@/types";
import { RATE_LIMIT } from "./constants";
import { fetchStockDataFromAlphaVantage } from "./alphaVantageApi";

// ============================================================================
// RATE LIMITING
// ============================================================================

function checkRateLimit(): boolean {
    if (typeof window === "undefined") return true; // Server-side bypass

    const now = Date.now();
    const raw = localStorage.getItem(RATE_LIMIT.STORAGE_KEY);
    let requests: number[] = raw ? JSON.parse(raw) : [];

    // Filter out old requests
    requests = requests.filter((timestamp) => now - timestamp < RATE_LIMIT.WINDOW_MS);

    if (requests.length >= RATE_LIMIT.MAX_REQUESTS) {
        return false;
    }

    requests.push(now);
    localStorage.setItem(RATE_LIMIT.STORAGE_KEY, JSON.stringify(requests));
    return true;
}

// ============================================================================
// EXPORT
// ============================================================================

export async function fetchStockAnalysis(symbol: string): Promise<FullAnalysis | null> {
    if (!checkRateLimit()) {
        throw new Error("RATE_LIMIT_EXCEEDED");
    }

    const normalizedSymbol = symbol.toUpperCase();

    // Only use Alpha Vantage for real-time data
    const alphaVantageKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
    if (!alphaVantageKey) {
        throw new Error("API_KEY_NOT_CONFIGURED: Please configure NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY");
    }

    console.log("🔄 Fetching live data from Alpha Vantage...");
    try {
        const alphaData = await fetchStockDataFromAlphaVantage(normalizedSymbol);

        if (alphaData) {
            console.log("✅ Using Alpha Vantage real-time data");
            return alphaData;
        } else {
            throw new Error("NO_DATA_AVAILABLE: Unable to fetch data for this symbol");
        }
    } catch (error: any) {
        console.error("❌ Alpha Vantage fetch failed:", error);

        // Handle different error types with specific messages
        if (error.message?.includes("API_LIMIT_EXCEEDED")) {
            // Client-side rate limit (our tracker)
            throw new Error("RATE_LIMIT_EXCEEDED: You've reached the request limit. Please wait a moment before trying again.");
        }

        if (error.message?.includes("ALPHA_VANTAGE_RATE_LIMIT")) {
            // Server-side rate limit (Alpha Vantage)
            throw new Error("RATE_LIMIT_EXCEEDED: Alpha Vantage API limit reached. Please wait 1 minute before searching again.");
        }

        if (error.message?.includes("API_KEY_NOT_CONFIGURED")) {
            throw error;
        }

        // For other errors, throw a user-friendly message
        throw new Error(`FETCH_FAILED: ${error.message || "Unable to fetch stock data"}`);
    }
}

export async function fetchMarketStatus(): Promise<MarketStatus[]> {
    // Return empty array - market status not critical
    return [];
}
