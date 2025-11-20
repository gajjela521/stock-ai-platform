import { FullAnalysis, StockData } from "@/types";

// Mock Data
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
        },
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
        },
    },
};

export async function fetchStockAnalysis(symbol: string): Promise<FullAnalysis | null> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const normalizedSymbol = symbol.toUpperCase();

    // Return mock data if available
    if (MOCK_DATA[normalizedSymbol]) {
        return MOCK_DATA[normalizedSymbol];
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
        deals: [],
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
        },
    };
}
