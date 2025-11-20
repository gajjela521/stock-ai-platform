import {
    FullAnalysis,
    MarketStatus,
} from "@/types";
import { RATE_LIMIT, DEFAULTS } from "./constants";
import { fetchStockDataFromAlphaVantage } from "./alphaVantageApi";
import { getMockData, getDefaultMarketStatus } from "./mockData"; // Assuming mock data functions are in a separate file

// ============================================================================
// RATE LIMITING
// ============================================================================

function checkRateLimit(): boolean {
    if (typeof window === "undefined") return true; // Server-side bypass

    const now = Date.now();
    const raw = localStorage.getItem(RATE_LIMIT.STORAGE_KEY);
    let requests: number[] = raw ? JSON.parse(raw) : [];

    // Filter out old requests
    requests = requests.filter((time) => now - time < RATE_LIMIT.WINDOW_MS);

    if (requests.length >= RATE_LIMIT.MAX_REQUESTS) {
        return false;
    }

    requests.push(now);
    localStorage.setItem(RATE_LIMIT.STORAGE_KEY, JSON.stringify(requests));
    return true;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getApiKey(): string | null {
    return process.env.NEXT_PUBLIC_FMP_API_KEY || null;
}

function buildUrl(endpoint: string, params?: Record<string, string>): string {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error(ERROR_MESSAGES.API_KEY_MISSING);

    const url = new URL(`${FMP_BASE_URL}${endpoint}`);
    url.searchParams.append("apikey", apiKey);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
    }

    return url.toString();
}

async function fetchAPI<T>(url: string): Promise<T | null> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`API Error: ${response.status} ${response.statusText}`);
            return null;
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Network error:", error);
        return null;
    }
}

// Deterministic random number generator
function getDeterministicRandom(seed: string, offset: number = 0): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash = hash & hash;
    }
    const x = Math.sin(hash + offset) * 10000;
    return x - Math.floor(x);
}

// ============================================================================
// FMP API CALLS
// ============================================================================

async function fetchQuoteData(symbol: string): Promise<FMPQuoteResponse | null> {
    const url = buildUrl(FMP_ENDPOINTS.QUOTE(symbol));
    const data = await fetchAPI<FMPQuoteResponse[]>(url);
    return data && data.length > 0 ? data[0] : null;
}

async function fetchProfileData(symbol: string): Promise<FMPProfileResponse | null> {
    const url = buildUrl(FMP_ENDPOINTS.PROFILE(symbol));
    const data = await fetchAPI<FMPProfileResponse[]>(url);
    return data && data.length > 0 ? data[0] : null;
}

async function fetchMetricsData(symbol: string): Promise<FMPMetricsResponse | null> {
    const url = buildUrl(FMP_ENDPOINTS.KEY_METRICS_TTM(symbol));
    const data = await fetchAPI<FMPMetricsResponse[]>(url);
    return data && data.length > 0 ? data[0] : null;
}

async function fetchBalanceSheetData(symbol: string): Promise<FMPBalanceSheetResponse | null> {
    const url = buildUrl(FMP_ENDPOINTS.BALANCE_SHEET(symbol), { period: "annual", limit: "1" });
    const data = await fetchAPI<FMPBalanceSheetResponse[]>(url);
    return data && data.length > 0 ? data[0] : null;
}

async function fetchNewsData(symbol: string): Promise<FMPNewsResponse[]> {
    const url = buildUrl(FMP_ENDPOINTS.STOCK_NEWS(symbol), { tickers: symbol, limit: "5" });
    const data = await fetchAPI<FMPNewsResponse[]>(url);
    return data || [];
}

async function fetchMarketHours(): Promise<MarketStatus[]> {
    const apiKey = getApiKey();
    if (!apiKey) return [];

    try {
        const url = buildUrl(FMP_ENDPOINTS.MARKET_HOURS());
        const data = await fetchAPI<any>(url);

        // FMP market-hours endpoint returns an object with exchange statuses
        if (data && typeof data === "object") {
            const statuses: MarketStatus[] = [];
            Object.entries(data).forEach(([exchange, info]: [string, any]) => {
                statuses.push({
                    exchange: exchange,
                    status: info?.isTheStockMarketOpen ? "open" : "closed",
                    timezone: info?.timezone || "UTC",
                });
            });
            return statuses;
        }
        return [];
    } catch (error) {
        console.error("Error fetching market hours:", error);
        return [];
    }
}

async function fetchInstitutionalHolders(symbol: string): Promise<any[]> {
    const url = buildUrl(FMP_ENDPOINTS.INSTITUTIONAL_HOLDERS(symbol));
    const data = await fetchAPI<any[]>(url);
    return data || [];
}

async function fetchStockPeers(symbol: string): Promise<any> {
    const url = buildUrl(FMP_ENDPOINTS.STOCK_PEERS()) + `&symbol=${symbol}`;
    const data = await fetchAPI<any>(url);
    return data || null;
}

// ============================================================================
// DATA TRANSFORMATION
// ============================================================================

function transformToStockData(
    quote: FMPQuoteResponse,
    profile: FMPProfileResponse | null
): StockData {
    return {
        symbol: quote.symbol,
        companyName: profile?.companyName || quote.name,
        price: quote.price,
        change: quote.change,
        changePercent: quote.changesPercentage,
        currency: profile?.currency || DEFAULTS.CURRENCY,
        exchange: quote.exchange,
        marketCap: quote.marketCap,
        sector: profile?.sector || DEFAULTS.SECTOR,
        industry: profile?.industry || DEFAULTS.INDUSTRY,
        description: profile?.description || DEFAULTS.DESCRIPTION,
        logoUrl: profile?.image,
        lastUpdated: quote.timestamp || Date.now(),
    };
}

function transformToFinancials(
    quote: FMPQuoteResponse,
    metrics: FMPMetricsResponse | null
): FinancialMetric[] {
    const sharesOutstanding = quote.sharesOutstanding || 1;
    const revenue = metrics?.revenuePerShareTTM ? metrics.revenuePerShareTTM * sharesOutstanding : 0;
    const netIncome = metrics?.netIncomePerShareTTM ? metrics.netIncomePerShareTTM * sharesOutstanding : 0;

    return [
        {
            label: "Revenue (TTM)",
            value: revenue > 0 ? `$${(revenue / 1e9).toFixed(2)}B` : "N/A",
            trend: "neutral",
        },
        {
            label: "Net Income",
            value: netIncome > 0 ? `$${(netIncome / 1e9).toFixed(2)}B` : "N/A",
            trend: "neutral",
        },
        {
            label: "P/E Ratio",
            value: quote.pe ? quote.pe.toFixed(2) : "N/A",
            trend: "neutral",
        },
        {
            label: "EPS",
            value: quote.eps ? quote.eps.toFixed(2) : "N/A",
            trend: "neutral",
        },
    ];
}

function transformToBalanceSheet(balanceSheet: FMPBalanceSheetResponse | null): BalanceSheet {
    if (!balanceSheet) {
        return {
            totalAssets: 0,
            totalLiabilities: 0,
            totalEquity: 0,
            cashAndEquivalents: 0,
            longTermDebt: 0,
        };
    }

    return {
        totalAssets: balanceSheet.totalAssets || 0,
        totalLiabilities: balanceSheet.totalLiabilities || 0,
        totalEquity: balanceSheet.totalEquity || 0,
        cashAndEquivalents: balanceSheet.cashAndCashEquivalents || 0,
        longTermDebt: balanceSheet.longTermDebt || 0,
    };
}

function transformToDeals(news: FMPNewsResponse[]): Deal[] {
    return news.map((article, index) => ({
        id: `${article.symbol}-${index}`,
        date: new Date(article.publishedDate).toISOString().split("T")[0],
        title: article.title,
        description: article.text.substring(0, 200) + "...",
        sentiment: determineSentiment(article.title + " " + article.text),
    }));
}

function determineSentiment(text: string): "positive" | "negative" | "neutral" {
    const lowerText = text.toLowerCase();
    const positiveWords = ["growth", "profit", "gain", "success", "beat", "surge", "rise", "up"];
    const negativeWords = ["loss", "decline", "fall", "miss", "drop", "down", "lawsuit", "investigation"];

    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

    if (positiveCount > negativeCount) return "positive";
    if (negativeCount > positiveCount) return "negative";
    return "neutral";
}

function transformToOwnership(holders: any[]): { retailPercentage: number; institutionalPercentage: number; insiderPercentage: number } {
    if (!holders || holders.length === 0) {
        return {
            retailPercentage: 50,
            institutionalPercentage: 50,
            insiderPercentage: 0,
        };
    }

    // Calculate total shares held by institutions
    const totalInstitutionalShares = holders.reduce((sum, holder) => sum + (holder.shares || 0), 0);

    // Get the first holder's data to find total shares outstanding
    const totalShares = holders[0]?.totalShares || 1;

    // Calculate institutional percentage
    const institutionalPercentage = Math.min(100, (totalInstitutionalShares / totalShares) * 100);

    // Estimate insider and retail (simplified)
    const insiderPercentage = Math.min(20, 100 - institutionalPercentage);
    const retailPercentage = Math.max(0, 100 - institutionalPercentage - insiderPercentage);

    return {
        retailPercentage: parseFloat(retailPercentage.toFixed(1)),
        institutionalPercentage: parseFloat(institutionalPercentage.toFixed(1)),
        insiderPercentage: parseFloat(insiderPercentage.toFixed(1)),
    };
}

async function transformToCompetitors(peersData: any, symbol: string): Promise<Competitor[]> {
    if (!peersData || !peersData.peersList || peersData.peersList.length === 0) {
        return [];
    }

    // Get peer symbols (filter out the current symbol)
    const peerSymbols = peersData.peersList
        .filter((peer: string) => peer !== symbol)
        .slice(0, 5); // Limit to 5 competitors

    if (peerSymbols.length === 0) return [];

    try {
        // Fetch quotes for all peers
        const apiKey = getApiKey();
        if (!apiKey) return [];

        const symbolList = peerSymbols.join(",");
        const url = buildUrl(FMP_ENDPOINTS.BATCH_QUOTE()) + `/${symbolList}`;
        const quotes = await fetchAPI<any[]>(url);

        if (!quotes || quotes.length === 0) return [];

        return quotes.map(quote => ({
            symbol: quote.symbol,
            name: quote.name || quote.symbol,
            price: quote.price || 0,
            changePercent: quote.changesPercentage || 0,
            marketCap: quote.marketCap || 0,
        })).filter(comp => comp.marketCap > 0);
    } catch (error) {
        console.error("Error fetching competitor data:", error);
        return [];
    }
}

// ============================================================================

function calculatePrediction(
    quote: FMPQuoteResponse,
    metrics: FMPMetricsResponse | null
): Prediction {
    const peRatio = quote.pe || 20;
    const eps = quote.eps || 1;
    const revenue = metrics?.revenuePerShareTTM ? metrics.revenuePerShareTTM * quote.sharesOutstanding : 0;

    // Heuristic-based prediction
    let sentimentScore = 0;
    let marketTrend: "bullish" | "bearish" | "neutral" = "neutral";
    let priceTarget = quote.price;

    if (peRatio < 25 && eps > 0) {
        sentimentScore = 0.6;
        marketTrend = "bullish";
        priceTarget = quote.price * 1.15;
    } else if (peRatio > 50 || eps < 0) {
        sentimentScore = -0.4;
        marketTrend = "bearish";
        priceTarget = quote.price * 0.90;
    } else {
        sentimentScore = 0.1;
        marketTrend = "neutral";
        priceTarget = quote.price * 1.05;
    }

    // Add deterministic variation
    const rand = (offset: number) => getDeterministicRandom(quote.symbol, offset);
    priceTarget = priceTarget * (0.95 + rand(1) * 0.1);

    return {
        nextQuarterRevenueForecast: revenue * (1 + (rand(2) * 0.1)),
        nextQuarterEPSForecast: eps * (1 + (rand(3) * 0.15)),
        confidenceScore: 0.7 + (rand(4) * 0.2),
        reasoning: [
            `P/E Ratio of ${peRatio.toFixed(2)} suggests ${marketTrend} sentiment.`,
            `EPS trend indicates ${eps > 0 ? "profitability" : "challenges"}.`,
            "Market volatility factored into price target.",
        ],
        sentimentScore,
        marketTrend,
        priceTarget: parseFloat(priceTarget.toFixed(2)),
        nextQuarterPositives: [
            "Revenue growth potential",
            "Market position stability",
        ],
    };
}

// ============================================================================
// MAIN API FUNCTION
// ============================================================================

async function fetchRealData(symbol: string): Promise<FullAnalysis | null> {
    const apiKey = getApiKey();
    if (!apiKey) return null;

    try {
        // Fetch all data in parallel
        const [quote, profile, metrics, balanceSheet, news, institutionalHolders, stockPeers] = await Promise.all([
            fetchQuoteData(symbol),
            fetchProfileData(symbol),
            fetchMetricsData(symbol),
            fetchBalanceSheetData(symbol),
            fetchNewsData(symbol),
            fetchInstitutionalHolders(symbol),
            fetchStockPeers(symbol),
        ]);

        if (!quote) return null;

        // Transform ownership data
        const ownership = transformToOwnership(institutionalHolders);

        // Transform competitors data
        const competitors = await transformToCompetitors(stockPeers, symbol);

        return {
            stock: transformToStockData(quote, profile),
            financials: transformToFinancials(quote, metrics),
            balanceSheet: transformToBalanceSheet(balanceSheet),
            deals: transformToDeals(news),
            prediction: calculatePrediction(quote, metrics),
            ownership,
            competitors,
            marketStatus: [],
        };
    } catch (error) {
        console.error("Error fetching real data:", error);
        return null;
    }
}

// ============================================================================
// MOCK DATA (Fallback)
// ============================================================================

const MOCK_DATA: Record<string, FullAnalysis> = {
    AAPL: {
        stock: {
            symbol: "AAPL",
            companyName: "Apple Inc.",
            price: 189.50,
            change: 2.35,
            changePercent: 1.25,
            currency: "USD",
            exchange: "NASDAQ",
            marketCap: 2950000000000,
            sector: "Technology",
            industry: "Consumer Electronics",
            description: "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.",
            logoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
        },
        financials: [
            { label: "Revenue (TTM)", value: "$383.29B", trend: "up" },
            { label: "Net Income", value: "$96.99B", trend: "up" },
            { label: "P/E Ratio", value: 30.5, trend: "neutral" },
            { label: "EPS", value: 6.13, trend: "up" },
        ],
        balanceSheet: {
            totalAssets: 352000000000,
            totalLiabilities: 290000000000,
            totalEquity: 62000000000,
            cashAndEquivalents: 166000000000,
            longTermDebt: 95000000000,
        },
        deals: [
            {
                id: "1",
                date: "2024-05-15",
                title: "Apple Acquires AI Startup for $200M",
                description: "Strategic acquisition to boost Siri's capabilities.",
                value: "$200M",
                sentiment: "positive",
            },
        ],
        prediction: {
            nextQuarterRevenueForecast: 95000000000,
            nextQuarterEPSForecast: 1.65,
            confidenceScore: 0.88,
            reasoning: [
                "Strong iPhone 16 cycle expected based on supply chain leaks.",
                "Services revenue continuing double-digit growth.",
            ],
            sentimentScore: 0.75,
            marketTrend: "bullish",
            priceTarget: 210.00,
            nextQuarterPositives: [
                "Launch of Apple Intelligence features",
                "Holiday season sales boost",
            ],
        },
        ownership: {
            retailPercentage: 40,
            institutionalPercentage: 59,
            insiderPercentage: 1,
        },
        competitors: [],
        marketStatus: [],
    },
};

// ============================================================================
// EXPORT
// ============================================================================

export async function fetchStockAnalysis(symbol: string): Promise<FullAnalysis | null> {
    if (!checkRateLimit()) {
        throw new Error("RATE_LIMIT_EXCEEDED");
    }

    const normalizedSymbol = symbol.toUpperCase();

    // Try Alpha Vantage first (primary data source)
    const alphaVantageKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
    if (alphaVantageKey) {
        console.log("🔄 Attempting to fetch from Alpha Vantage...");
        try {
            const { fetchStockDataFromAlphaVantage } = await import("./alphaVantageApi");
            const alphaData = await fetchStockDataFromAlphaVantage(normalizedSymbol);
            if (alphaData) {
                console.log("✅ Using Alpha Vantage real-time data");
                return alphaData;
            }
        } catch (error) {
            console.warn("Alpha Vantage fetch failed:", error);
        }
    }

    // Simulate API delay for mock data
    await new Promise((resolve) => setTimeout(resolve, 1000));

    let marketStatus: MarketStatus[] = [];

    // Try fetching FMP data as fallback (will likely fail with free tier)
    if (getApiKey()) {
        const [realData, statusData] = await Promise.all([
            fetchRealData(normalizedSymbol),
            fetchMarketHours()
        ]);

        marketStatus = statusData;

        if (realData) {
            console.log("✅ Using FMP data");
            return { ...realData, marketStatus };
        }
    }

    // Mock Market Status if no key or fetch failed
    if (marketStatus.length === 0) {
        marketStatus = [
            { exchange: "NASDAQ", status: "closed", timezone: "EST" },
            { exchange: "NYSE", status: "closed", timezone: "EST" },
            { exchange: "TSX", status: "closed", timezone: "EST" },
            { exchange: "LSE", status: "closed", timezone: "GMT" },
            { exchange: "EURONEXT", status: "closed", timezone: "CET" },
            { exchange: "XETRA", status: "closed", timezone: "CET" },
            { exchange: "JPX", status: "open", timezone: "JST" },
            { exchange: "HKSE", status: "open", timezone: "HKT" },
            { exchange: "SHZ", status: "open", timezone: "CST" },
        ];
    }

    // Return mock data if available
    if (MOCK_DATA[normalizedSymbol]) {
        return { ...MOCK_DATA[normalizedSymbol], marketStatus };
    }

    // Fallback for unknown stocks (generate deterministic mock data)
    const rand = (offset: number) => getDeterministicRandom(normalizedSymbol, offset);
    const price = 50 + rand(1) * 950;
    const change = (rand(2) * 20) - 10;
    const changePercent = (rand(3) * 10) - 5;
    const marketCap = 1000000000 + rand(4) * 2000000000000;

    return {
        stock: {
            symbol: normalizedSymbol,
            companyName: `${normalizedSymbol} Corp`,
            price: price,
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(2)),
            currency: "USD",
            exchange: "NYSE",
            marketCap: marketCap,
            sector: "Technology",
            industry: "Software",
            description: "A generic company description for demonstration purposes.",
            logoUrl: "",
            lastUpdated: Date.now(),
        },
        financials: [
            { label: "Revenue (TTM)", value: `$${(10 + rand(5) * 100).toFixed(1)}B`, trend: rand(6) > 0.5 ? "up" : "down" },
            { label: "Net Income", value: `$${(1 + rand(7) * 20).toFixed(1)}B`, trend: rand(8) > 0.5 ? "up" : "down" },
            { label: "P/E Ratio", value: (10 + rand(9) * 50).toFixed(1), trend: "neutral" },
            { label: "EPS", value: (1 + rand(10) * 10).toFixed(2), trend: "up" },
        ],
        balanceSheet: {
            totalAssets: 50000000000,
            totalLiabilities: 20000000000,
            totalEquity: 30000000000,
            cashAndEquivalents: 5000000000,
            longTermDebt: 10000000000,
        },
        deals: [
            {
                id: "1",
                date: "2024-05-20",
                title: "Quarterly Earnings Beat Expectations",
                description: "Company reports strong growth in cloud segment.",
                sentiment: "positive",
            },
        ],
        prediction: {
            nextQuarterRevenueForecast: 3000000000,
            nextQuarterEPSForecast: 1.10,
            confidenceScore: 0.5 + (rand(11) * 0.4),
            reasoning: [
                "Insufficient data for accurate prediction.",
                "General market sentiment is neutral.",
            ],
            sentimentScore: (rand(12) * 2) - 1,
            marketTrend: rand(13) > 0.6 ? "bullish" : rand(13) < 0.4 ? "bearish" : "neutral",
            priceTarget: price * (0.8 + rand(14) * 0.4),
            nextQuarterPositives: [
                "Stable cash flow",
                "Potential dividend increase",
            ],
        },
        ownership: {
            retailPercentage: 30,
            institutionalPercentage: 60,
            insiderPercentage: 10,
        },
        competitors: [],
        marketStatus,
    };
}
