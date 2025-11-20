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

export interface Ownership {
    retailPercentage: number;
    institutionalPercentage: number;
    insiderPercentage: number;
}

export interface Competitor {
    symbol: string;
    name: string;
    price: number;
    changePercent: number;
}

export interface Prediction {
    nextQuarterRevenueForecast: number;
    nextQuarterEPSForecast: number;
    confidenceScore: number; // 0 to 1
    reasoning: string[];
    sentimentScore: number; // -1 to 1
    marketTrend: "bullish" | "bearish" | "neutral";
    priceTarget: number;
    nextQuarterPositives: string[];
}

export interface MarketStatus {
    exchange: string;
    status: string; // "open" | "closed"
    timezone: string;
}

export interface FullAnalysis {
    stock: StockData;
    financials: FinancialMetric[];
    balanceSheet: BalanceSheet;
    deals: Deal[];
    prediction: Prediction;
    ownership: Ownership;
    competitors: Competitor[];
    marketStatus: MarketStatus[];
}
