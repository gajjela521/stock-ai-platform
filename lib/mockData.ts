import { FullAnalysis, SearchResult } from "@/types";
import { BasketCalculation, BasketStock, StockBreakdown, TimePeriod } from "@/types/basket";
import { StockMover } from "@/types/market";

// Mock Search Results
export const MOCK_SEARCH_RESULTS: SearchResult[] = [
    { symbol: "AAPL", name: "Apple Inc.", type: "Equity", region: "United States", marketOpen: "09:30", marketClose: "16:00", timezone: "UTC-04", currency: "USD", matchScore: "1.0000" },
    { symbol: "MSFT", name: "Microsoft Corporation", type: "Equity", region: "United States", marketOpen: "09:30", marketClose: "16:00", timezone: "UTC-04", currency: "USD", matchScore: "0.8000" },
    { symbol: "GOOGL", name: "Alphabet Inc.", type: "Equity", region: "United States", marketOpen: "09:30", marketClose: "16:00", timezone: "UTC-04", currency: "USD", matchScore: "0.7500" },
    { symbol: "AMZN", name: "Amazon.com Inc.", type: "Equity", region: "United States", marketOpen: "09:30", marketClose: "16:00", timezone: "UTC-04", currency: "USD", matchScore: "0.7000" },
    { symbol: "TSLA", name: "Tesla Inc.", type: "Equity", region: "United States", marketOpen: "09:30", marketClose: "16:00", timezone: "UTC-04", currency: "USD", matchScore: "0.6500" }
];

// Mock Market Movers
export const MOCK_GAINERS: StockMover[] = [
    { ticker: "NVDA", price: "824.50", change_amount: "24.50", change_percentage: "3.06%", volume: "50000000" },
    { ticker: "AMD", price: "180.25", change_amount: "5.25", change_percentage: "3.00%", volume: "30000000" },
    { ticker: "META", price: "485.90", change_amount: "12.40", change_percentage: "2.62%", volume: "25000000" },
    { ticker: "NFLX", price: "610.30", change_amount: "15.10", change_percentage: "2.54%", volume: "15000000" },
    { ticker: "AVGO", price: "1320.45", change_amount: "30.20", change_percentage: "2.34%", volume: "10000000" }
];

export const MOCK_LOSERS: StockMover[] = [
    { ticker: "TSLA", price: "175.30", change_amount: "-4.20", change_percentage: "-2.34%", volume: "80000000" },
    { ticker: "AAPL", price: "168.45", change_amount: "-2.15", change_percentage: "-1.26%", volume: "60000000" },
    { ticker: "GOOG", price: "148.20", change_amount: "-1.80", change_percentage: "-1.20%", volume: "40000000" },
    { ticker: "INTC", price: "42.10", change_amount: "-0.45", change_percentage: "-1.06%", volume: "35000000" },
    { ticker: "CSCO", price: "48.90", change_amount: "-0.35", change_percentage: "-0.71%", volume: "20000000" }
];

// Mock Full Analysis Data
export const getMockStockAnalysis = (symbol: string): FullAnalysis => ({
    stock: {
        symbol: symbol.toUpperCase(),
        companyName: `${symbol.toUpperCase()} Corp`,
        price: 150.25,
        change: 2.50,
        changePercent: 1.69,
        currency: "USD",
        exchange: "NASDAQ",
        marketCap: 2500000000000,
        sector: "Technology",
        industry: "Consumer Electronics",
        description: "This is a mock description for test mode purposes. The company is a leading technology provider.",
        lastUpdated: Date.now()
    },
    financials: [
        { label: "Revenue", value: "385.6B", trend: "up" },
        { label: "Net Income", value: "97.0B", trend: "up" },
        { label: "EPS", value: "6.15", trend: "up" },
        { label: "P/E Ratio", value: "28.5", trend: "neutral" }
    ],
    balanceSheet: {
        totalAssets: 350000000000,
        totalLiabilities: 250000000000,
        totalEquity: 100000000000,
        cashAndEquivalents: 50000000000,
        totalDebt: 100000000000
    },
    deals: [],
    prediction: {
        nextQuarterRevenueForecast: 95000000000,
        nextQuarterEPSForecast: 1.55,
        confidenceScore: 0.85,
        reasoning: ["Strong product demand", "Market leadership", "Positive sentiment"],
        sentimentScore: 0.75,
        marketTrend: "bullish",
        priceTarget: 180.00,
        nextQuarterPositives: ["New product launch", "Cost reduction"]
    },
    ownership: {
        institutionalPercentage: 60,
        insiderPercentage: 5,
        retailPercentage: 35
    },
    competitors: [
        { symbol: "MSFT", name: "Microsoft", price: 420.50, changePercent: 1.2 },
        { symbol: "GOOGL", name: "Alphabet", price: 175.20, changePercent: 0.8 },
        { symbol: "AMZN", name: "Amazon", price: 180.10, changePercent: -0.5 }
    ],
    marketStatus: []
});

// Mock Basket Calculation
export const getMockBasketCalculation = (stocks: BasketStock[], timePeriod: TimePeriod): BasketCalculation => {
    // Generate deterministic mock returns based on symbol length
    const breakdown: StockBreakdown[] = stocks.map(stock => {
        const seed = stock.symbol.length;
        const returnRate = (seed % 2 === 0 ? 0.15 : -0.05) * (timePeriod === '1Y' ? 1 : 0.5);

        const currentPrice = 100 + (seed * 10);
        const historicalPrice = currentPrice / (1 + returnRate);

        const currentValue = stock.shares * currentPrice;
        const historicalValue = stock.shares * historicalPrice;
        const returnAmount = currentValue - historicalValue;
        const returnPercentage = (returnAmount / historicalValue) * 100;

        return {
            symbol: stock.symbol,
            name: stock.name,
            shares: stock.shares,
            currentPrice,
            historicalPrice,
            currentValue,
            historicalValue,
            return: returnAmount,
            returnPercentage
        };
    });

    const currentValue = breakdown.reduce((sum, item) => sum + item.currentValue, 0);
    const historicalValue = breakdown.reduce((sum, item) => sum + item.historicalValue, 0);
    const totalReturn = currentValue - historicalValue;
    const returnPercentage = (totalReturn / historicalValue) * 100;

    // Calculate a mock date based on time period
    const now = new Date();
    const mockDate = new Date(now);
    if (timePeriod === '1M') mockDate.setMonth(now.getMonth() - 1);
    else if (timePeriod === '3M') mockDate.setMonth(now.getMonth() - 3);
    else if (timePeriod === '6M') mockDate.setMonth(now.getMonth() - 6);
    else if (timePeriod === '1Y') mockDate.setFullYear(now.getFullYear() - 1);
    else if (timePeriod === '2Y') mockDate.setFullYear(now.getFullYear() - 2);
    else if (timePeriod === '3Y') mockDate.setFullYear(now.getFullYear() - 3);
    else if (timePeriod === '4Y') mockDate.setFullYear(now.getFullYear() - 4);
    else if (timePeriod === '5Y') mockDate.setFullYear(now.getFullYear() - 5);
    else if (timePeriod === '10Y') mockDate.setFullYear(now.getFullYear() - 10);

    return {
        stocks,
        timePeriod,
        fromDate: mockDate.toISOString(),
        currentValue,
        historicalValue,
        totalReturn,
        returnPercentage,
        breakdown,
        calculatedAt: Date.now()
    };
};
