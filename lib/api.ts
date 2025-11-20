import { FullAnalysis, StockData, FinancialMetric, BalanceSheet, Deal, Prediction, Ownership, Competitor } from "@/types";

// Rate Limiting Logic
const RATE_LIMIT_KEY = "stock_api_rate_limit";
const MAX_REQUESTS = 100; // Increased to 100 per user request
const WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(): boolean {
    if (typeof window === "undefined") return true; // Server-side bypass

    const now = Date.now();
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    let requests: number[] = raw ? JSON.parse(raw) : [];

    // Filter out old requests
    requests = requests.filter((time) => now - time < WINDOW_MS);

    if (requests.length >= MAX_REQUESTS) {
        return false;
    }

    requests.push(now);
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(requests));
    return true;
}

// FMP API Integration
const FMP_API_KEY = process.env.NEXT_PUBLIC_FMP_API_KEY;
const BASE_URL = "https://financialmodelingprep.com/api/v3";

async function fetchRealData(symbol: string): Promise<FullAnalysis | null> {
    if (!FMP_API_KEY) return null;

    try {
        const [quoteRes, profileRes, metricsRes] = await Promise.all([
            fetch(`${BASE_URL}/quote/${symbol}?apikey=${FMP_API_KEY}`),
            fetch(`${BASE_URL}/profile/${symbol}?apikey=${FMP_API_KEY}`),
            fetch(`${BASE_URL}/key-metrics-ttm/${symbol}?apikey=${FMP_API_KEY}`),
        ]);

        const quote = await quoteRes.json();
        const profile = await profileRes.json();
        const metrics = await metricsRes.json();

        if (!quote || quote.length === 0) return null;

        const q = quote[0];
        const p = profile[0];
        const m = metrics[0];

        // Construct Real Data Object
        const stock: StockData = {
            symbol: q.symbol,
            companyName: q.name,
            price: q.price,
            change: q.change,
            changePercent: q.changesPercentage,
            currency: p?.currency || "USD",
            exchange: q.exchange,
            marketCap: q.marketCap,
            sector: p?.sector || "Unknown",
            industry: p?.industry || "Unknown",
            description: p?.description || "No description available.",
            logoUrl: p?.image,
        };

        const financials: FinancialMetric[] = [
            { label: "Revenue (TTM)", value: m?.revenuePerShareTTM ? `$${(m.revenuePerShareTTM * q.sharesOutstanding / 1e9).toFixed(2)}B` : "N/A", trend: "neutral" },
            { label: "Net Income", value: m?.netIncomePerShareTTM ? `$${(m.netIncomePerShareTTM * q.sharesOutstanding / 1e9).toFixed(2)}B` : "N/A", trend: "neutral" },
            { label: "P/E Ratio", value: q.pe ? q.pe.toFixed(2) : "N/A", trend: "neutral" },
            { label: "EPS", value: q.eps ? q.eps.toFixed(2) : "N/A", trend: "neutral" },
        ];

        // Mocking the rest for now as FMP free tier has limits or requires complex multiple calls
        // Ideally we would fetch balance sheet, ownership etc from FMP endpoints if available
        return {
            stock,
            financials,
            balanceSheet: {
                totalAssets: 0, // Placeholder
                totalLiabilities: 0,
                totalEquity: 0,
                cashAndEquivalents: 0,
                longTermDebt: 0,
            },
            deals: [], // FMP news endpoint is separate
            prediction: {
                nextQuarterRevenueForecast: 0,
                nextQuarterEPSForecast: 0,
                confidenceScore: 0.5,
                reasoning: ["Real-time prediction requires advanced AI model integration."],
                sentimentScore: 0,
                marketTrend: "neutral",
                priceTarget: q.price * 1.1, // Mock target
                nextQuarterPositives: ["Data fetched from live market"],
            },
            ownership: {
                retailPercentage: 50,
                institutionalPercentage: 50,
                insiderPercentage: 0,
            },
            competitors: [],
            marketStatus: [], // Populated later in fetchStockAnalysis
        };

    } catch (error) {
        console.error("Error fetching real data:", error);
        return null;
    }
}

// Mock Data (Fallback)
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
            {
                id: "2",
                date: "2024-04-10",
                title: "New Partnership with OpenAI Rumored",
                description: "Discussions ongoing for integrating ChatGPT into iOS.",
                sentiment: "positive",
            },
            {
                id: "3",
                date: "2024-03-22",
                title: "Antitrust Lawsuit Filed by DOJ",
                description: "US Department of Justice sues Apple over smartphone monopoly.",
                sentiment: "negative",
            },
        ],
        prediction: {
            nextQuarterRevenueForecast: 95000000000,
            nextQuarterEPSForecast: 1.65,
            confidenceScore: 0.88,
            reasoning: [
                "Strong iPhone 16 cycle expected based on supply chain leaks.",
                "Services revenue continuing double-digit growth.",
                "AI features in iOS 18 likely to drive upgrade cycle.",
            ],
            sentimentScore: 0.75,
            marketTrend: "bullish",
            priceTarget: 210.00,
            nextQuarterPositives: [
                "Launch of Apple Intelligence features",
                "Holiday season sales boost",
                "Services margin expansion",
            ],
        },
        ownership: {
            retailPercentage: 40,
            institutionalPercentage: 59,
            insiderPercentage: 1,
        },
        competitors: [
            { symbol: "MSFT", name: "Microsoft", price: 420.50, changePercent: 0.8 },
            { symbol: "GOOGL", name: "Alphabet", price: 175.30, changePercent: -0.5 },
            { symbol: "SAMSUNG", name: "Samsung", price: 1100.00, changePercent: 1.2 },
        ],
        marketStatus: [
            { exchange: "NASDAQ", status: "closed", timezone: "EST" },
            { exchange: "NYSE", status: "closed", timezone: "EST" },
            { exchange: "AMEX", status: "closed", timezone: "EST" },
            { exchange: "TSX", status: "closed", timezone: "EST" },
            { exchange: "TSXV", status: "closed", timezone: "EST" },
            { exchange: "LSE", status: "closed", timezone: "GMT" },
            { exchange: "XETRA", status: "closed", timezone: "CET" },
            { exchange: "EURONEXT", status: "closed", timezone: "CET" },
            { exchange: "BRU", status: "closed", timezone: "CET" },
            { exchange: "AMS", status: "closed", timezone: "CET" },
            { exchange: "BSE", status: "closed", timezone: "IST" },
            { exchange: "JPX", status: "open", timezone: "JST" },
            { exchange: "HKSE", status: "open", timezone: "HKT" },
            { exchange: "SHZ", status: "open", timezone: "CST" },
            { exchange: "ASX", status: "open", timezone: "AEST" },
        ]
    },
    TSLA: {
        stock: {
            symbol: "TSLA",
            companyName: "Tesla, Inc.",
            price: 175.00,
            change: -5.20,
            changePercent: -2.88,
            currency: "USD",
            exchange: "NASDAQ",
            marketCap: 550000000000,
            sector: "Consumer Cyclical",
            industry: "Auto Manufacturers",
            description: "Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems in the United States, China, and internationally.",
            logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png"
        },
        financials: [
            { label: "Revenue (TTM)", value: "$96.77B", trend: "down" },
            { label: "Net Income", value: "$14.99B", trend: "down" },
            { label: "P/E Ratio", value: 45.2, trend: "down" },
            { label: "EPS", value: 3.10, trend: "down" },
        ],
        balanceSheet: {
            totalAssets: 106000000000,
            totalLiabilities: 43000000000,
            totalEquity: 63000000000,
            cashAndEquivalents: 29000000000,
            longTermDebt: 5000000000,
        },
        deals: [
            {
                id: "1",
                date: "2024-05-01",
                title: "Expansion of Supercharger Network",
                description: "Tesla announces new partnerships with major automakers.",
                sentiment: "positive",
            },
            {
                id: "2",
                date: "2024-04-20",
                title: "Price Cuts in China",
                description: "Aggressive pricing strategy to maintain market share.",
                sentiment: "negative",
            },
        ],
        prediction: {
            nextQuarterRevenueForecast: 24000000000,
            nextQuarterEPSForecast: 0.55,
            confidenceScore: 0.65,
            reasoning: [
                "Price cuts putting pressure on margins.",
                "Competition in China intensifying.",
                "FSD adoption rate remains a key wild card.",
            ],
            sentimentScore: -0.2,
            marketTrend: "bearish",
            priceTarget: 150.00,
            nextQuarterPositives: [
                "Cybertruck production ramp up",
                "Energy storage business growth",
                "Potential FSD licensing deals",
            ],
        },
        ownership: {
            retailPercentage: 45,
            institutionalPercentage: 42,
            insiderPercentage: 13,
        },
        competitors: [
            { symbol: "BYD", name: "BYD Co.", price: 28.50, changePercent: 2.1 },
            { symbol: "RIVN", name: "Rivian", price: 10.20, changePercent: -4.5 },
            { symbol: "F", name: "Ford", price: 12.10, changePercent: 0.5 },
        ],
        marketStatus: [
            { exchange: "NASDAQ", status: "closed", timezone: "EST" },
            { exchange: "NYSE", status: "closed", timezone: "EST" },
            { exchange: "AMEX", status: "closed", timezone: "EST" },
            { exchange: "TSX", status: "closed", timezone: "EST" },
            { exchange: "TSXV", status: "closed", timezone: "EST" },
            { exchange: "LSE", status: "closed", timezone: "GMT" },
            { exchange: "XETRA", status: "closed", timezone: "CET" },
            { exchange: "EURONEXT", status: "closed", timezone: "CET" },
            { exchange: "BRU", status: "closed", timezone: "CET" },
            { exchange: "AMS", status: "closed", timezone: "CET" },
            { exchange: "BSE", status: "closed", timezone: "IST" },
            { exchange: "JPX", status: "open", timezone: "JST" },
            { exchange: "HKSE", status: "open", timezone: "HKT" },
            { exchange: "SHZ", status: "open", timezone: "CST" },
            { exchange: "ASX", status: "open", timezone: "AEST" },
        ]
    },
};

// ... previous imports
import { MarketStatus } from "@/types";

// ... existing code ...

async function fetchMarketStatus(): Promise<MarketStatus[]> {
    if (!FMP_API_KEY) return [];

    try {
        const res = await fetch(`${BASE_URL}/is-the-market-open?apikey=${FMP_API_KEY}`);
        const data = await res.json();

        if (data && data.isTheStockMarketOpen) {
            // Map FMP response to our simplified structure
            // FMP returns specific exchanges, we need to map them or pass them through
            // For simplicity in this demo, we map the known ones from the user request
            return data.isTheStockMarketOpen.map((m: any) => ({
                exchange: m.exchange,
                status: m.isTheStockMarketOpen ? "open" : "closed",
                timezone: "UTC" // Simplified
            }));
        }
        return [];
    } catch (e) {
        console.error("Error fetching market status", e);
        return [];
    }
}

export async function fetchStockAnalysis(symbol: string): Promise<FullAnalysis | null> {
    if (!checkRateLimit()) {
        throw new Error("Rate limit exceeded. Please wait a minute.");
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const normalizedSymbol = symbol.toUpperCase();
    let marketStatus: MarketStatus[] = [];

    // Try fetching real data first if key is present
    if (FMP_API_KEY) {
        const [realData, statusData] = await Promise.all([
            fetchRealData(normalizedSymbol),
            fetchMarketStatus()
        ]);

        marketStatus = statusData;

        if (realData) {
            return { ...realData, marketStatus };
        }
    }

    // Mock Market Status if no key or fetch failed
    if (marketStatus.length === 0) {
        marketStatus = [
            { exchange: "NASDAQ", status: "closed", timezone: "EST" },
            { exchange: "NYSE", status: "closed", timezone: "EST" },
            { exchange: "AMEX", status: "closed", timezone: "EST" },
            { exchange: "TSX", status: "closed", timezone: "EST" },
            { exchange: "TSXV", status: "closed", timezone: "EST" },
            { exchange: "LSE", status: "closed", timezone: "GMT" },
            { exchange: "XETRA", status: "closed", timezone: "CET" },
            { exchange: "EURONEXT", status: "closed", timezone: "CET" },
            { exchange: "BRU", status: "closed", timezone: "CET" },
            { exchange: "AMS", status: "closed", timezone: "CET" },
            { exchange: "BSE", status: "closed", timezone: "IST" },
            { exchange: "JPX", status: "open", timezone: "JST" },
            { exchange: "HKSE", status: "open", timezone: "HKT" },
            { exchange: "SHZ", status: "open", timezone: "CST" },
            { exchange: "ASX", status: "open", timezone: "AEST" },
        ];
    }

    // Return mock data if available
    if (MOCK_DATA[normalizedSymbol]) {
        return { ...MOCK_DATA[normalizedSymbol], marketStatus };
    }

    // Fallback for unknown stocks (generate random-ish data)
    return {
        stock: {
            symbol: normalizedSymbol,
            companyName: `${normalizedSymbol} Corp`,
            price: Math.random() * 1000,
            change: Math.random() * 10 - 5,
            changePercent: Math.random() * 5 - 2.5,
            currency: "USD",
            exchange: "NYSE",
            marketCap: Math.random() * 1000000000000,
            sector: "Technology",
            industry: "Software",
            description: "A generic company description for demonstration purposes.",
            logoUrl: "",
        },
        financials: [
            { label: "Revenue (TTM)", value: "$10.5B", trend: "up" },
            { label: "Net Income", value: "$2.1B", trend: "up" },
            { label: "P/E Ratio", value: 25.4, trend: "neutral" },
            { label: "EPS", value: 4.20, trend: "up" },
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
            {
                id: "2",
                date: "2024-05-10",
                title: "New Product Line Announced",
                description: "Expansion into enterprise AI solutions.",
                sentiment: "positive",
            }
        ],
        prediction: {
            nextQuarterRevenueForecast: 3000000000,
            nextQuarterEPSForecast: 1.10,
            confidenceScore: 0.5,
            reasoning: [
                "Insufficient data for accurate prediction.",
                "General market sentiment is neutral.",
            ],
            sentimentScore: 0,
            marketTrend: "neutral",
            priceTarget: Math.random() * 1000,
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
        competitors: [
            { symbol: "COMP1", name: "Competitor A", price: 150.00, changePercent: 1.5 },
            { symbol: "COMP2", name: "Competitor B", price: 200.00, changePercent: -0.8 },
        ],
        marketStatus,
    };
}
