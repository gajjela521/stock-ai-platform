export interface StockData {
    symbol: string;
    companyName: string;
    price: number;
    change: number;
    changePercent: number;
    currency: string;
    exchange: string;
    marketCap: number;
    sector: string;
    industry: string;
    description: string;
    logoUrl?: string;
}

export interface FinancialMetric {
    label: string;
    value: string | number;
    trend?: "up" | "down" | "neutral";
}

export interface BalanceSheet {
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    cashAndEquivalents: number;
    longTermDebt: number;
}

export interface Deal {
    id: string;
    date: string;
    title: string;
    description: string;
    value?: string;
    sentiment: "positive" | "negative" | "neutral";
}

export interface Prediction {
    nextQuarterRevenueForecast: number;
    nextQuarterEPSForecast: number;
    confidenceScore: number; // 0 to 1
    reasoning: string[];
    sentimentScore: number; // -1 to 1
    marketTrend: "bullish" | "bearish" | "neutral";
}

export interface FullAnalysis {
    stock: StockData;
    financials: FinancialMetric[];
    balanceSheet: BalanceSheet;
    deals: Deal[];
    prediction: Prediction;
}
