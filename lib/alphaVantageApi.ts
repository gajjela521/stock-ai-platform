import { ALPHA_VANTAGE_BASE_URL, ALPHA_VANTAGE_FUNCTIONS, CACHE_DURATION_MS } from "./alphaVantageConstants";
import { StockData, FullAnalysis, FinancialMetric, BalanceSheet, Deal, Prediction } from "@/types";

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();

function getFromCache(key: string): any | null {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
        return cached.data;
    }
    cache.delete(key);
    return null;
}

function setCache(key: string, data: any): void {
    cache.set(key, { data, timestamp: Date.now() });
}

async function fetchAlphaVantage(params: Record<string, string>): Promise<any> {
    const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
        console.warn("Alpha Vantage API key not configured");
        return null;
    }

    const url = new URL(ALPHA_VANTAGE_BASE_URL);
    Object.entries({ ...params, apikey: apiKey }).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });

    const cacheKey = url.toString();
    const cached = getFromCache(cacheKey);
    if (cached) {
        console.log("Returning cached data for:", params.function, params.symbol);
        return cached;
    }

    try {
        console.log("Fetching from Alpha Vantage:", params.function, params.symbol);
        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Check for API errors
        if (data["Error Message"]) {
            throw new Error(data["Error Message"]);
        }

        if (data["Note"]) {
            // Rate limit message
            console.warn("Alpha Vantage rate limit:", data["Note"]);
            return null;
        }

        setCache(cacheKey, data);
        return data;
    } catch (error) {
        console.error("Alpha Vantage API error:", error);
        return null;
    }
}

export async function fetchStockDataFromAlphaVantage(symbol: string): Promise<FullAnalysis | null> {
    try {
        // Fetch quote and overview in parallel
        const [quoteData, overviewData] = await Promise.all([
            fetchAlphaVantage({ function: ALPHA_VANTAGE_FUNCTIONS.GLOBAL_QUOTE, symbol }),
            fetchAlphaVantage({ function: ALPHA_VANTAGE_FUNCTIONS.OVERVIEW, symbol }),
        ]);

        if (!quoteData || !overviewData) {
            return null;
        }

        const quote = quoteData["Global Quote"];
        if (!quote || !quote["05. price"]) {
            return null;
        }

        // Transform to our StockData format
        const stock: StockData = {
            symbol: symbol.toUpperCase(),
            companyName: overviewData.Name || symbol,
            price: parseFloat(quote["05. price"]),
            change: parseFloat(quote["09. change"]),
            changePercent: parseFloat(quote["10. change percent"]?.replace("%", "") || "0"),
            currency: "USD",
            exchange: overviewData.Exchange || "NASDAQ",
            marketCap: parseInt(overviewData.MarketCapitalization || "0"),
            sector: overviewData.Sector || "Unknown",
            industry: overviewData.Industry || "Unknown",
            description: overviewData.Description || "",
            lastUpdated: Date.now(),
        };

        // Financial metrics
        const financials: FinancialMetric[] = [
            {
                label: "Revenue (TTM)",
                value: overviewData.RevenueTTM ? `$${(parseInt(overviewData.RevenueTTM) / 1e9).toFixed(2)}B` : "N/A",
                trend: "neutral",
            },
            {
                label: "EPS",
                value: overviewData.EPS || "N/A",
                trend: parseFloat(overviewData.EPS || "0") > 0 ? "up" : "down",
            },
            {
                label: "P/E Ratio",
                value: overviewData.PERatio || "N/A",
                trend: "neutral",
            },
            {
                label: "Profit Margin",
                value: overviewData.ProfitMargin ? `${(parseFloat(overviewData.ProfitMargin) * 100).toFixed(2)}%` : "N/A",
                trend: parseFloat(overviewData.ProfitMargin || "0") > 0.1 ? "up" : "neutral",
            },
            {
                label: "ROE",
                value: overviewData.ReturnOnEquityTTM ? `${(parseFloat(overviewData.ReturnOnEquityTTM) * 100).toFixed(2)}%` : "N/A",
                trend: parseFloat(overviewData.ReturnOnEquityTTM || "0") > 0.15 ? "up" : "neutral",
            },
        ];

        // Balance sheet (simplified from overview data)
        const balanceSheet: BalanceSheet = {
            totalAssets: "N/A", // Not available in overview
            totalLiabilities: "N/A",
            totalEquity: overviewData.ShareholderEquity || "N/A",
            cashAndEquivalents: "N/A",
            totalDebt: "N/A",
        };

        // Generate prediction based on available data
        const prediction: Prediction = generatePrediction(stock, overviewData);

        // Mock data for features not available in Alpha Vantage free tier
        const deals: Deal[] = [];
        const ownership = {
            retailPercentage: 50,
            institutionalPercentage: 50,
            insiderPercentage: 0,
        };
        const competitors: any[] = [];

        return {
            stock,
            financials,
            balanceSheet,
            deals,
            prediction,
            ownership,
            competitors,
            marketStatus: [],
        };
    } catch (error) {
        console.error("Error fetching from Alpha Vantage:", error);
        return null;
    }
}

function generatePrediction(stock: StockData, overview: any): Prediction {
    const peRatio = parseFloat(overview.PERatio || "20");
    const eps = parseFloat(overview.EPS || "0");
    const profitMargin = parseFloat(overview.ProfitMargin || "0");

    // Simple prediction logic
    let sentiment = 0.5;
    if (peRatio < 15 && eps > 0) sentiment += 0.2;
    if (peRatio > 30) sentiment -= 0.2;
    if (profitMargin > 0.15) sentiment += 0.15;
    if (stock.changePercent > 2) sentiment += 0.1;
    if (stock.changePercent < -2) sentiment -= 0.1;

    sentiment = Math.max(0, Math.min(1, sentiment));

    const marketTrend = sentiment > 0.6 ? "bullish" : sentiment < 0.4 ? "bearish" : "neutral";
    const priceTarget = stock.price * (1 + (sentiment - 0.5) * 0.3);

    return {
        nextQuarterRevenueForecast: parseFloat(overview.RevenueTTM || "0") * 1.05,
        nextQuarterEPSForecast: eps * 1.03,
        confidenceScore: 0.7,
        reasoning: [
            `P/E Ratio of ${peRatio.toFixed(2)} suggests ${marketTrend} sentiment.`,
            `Current profit margin: ${(profitMargin * 100).toFixed(2)}%`,
            `Stock ${stock.changePercent > 0 ? "gained" : "lost"} ${Math.abs(stock.changePercent).toFixed(2)}% today.`,
        ],
        sentimentScore: sentiment,
        marketTrend,
        priceTarget: parseFloat(priceTarget.toFixed(2)),
        nextQuarterPositives: [
            "Market position stability",
            "Revenue growth potential",
        ],
    };
}
