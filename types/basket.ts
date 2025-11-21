// Basket Portfolio Calculator Types

export type TimePeriod = '1M' | '3M' | '6M' | '1Y' | '2Y' | '3Y' | '4Y' | '5Y' | '10Y';

export type StockCategory = 'Technology' | 'Finance' | 'Healthcare' | 'Consumer' | 'Energy';

export interface BasketStock {
    category: StockCategory;
    symbol: string;
    name: string;
    shares: number;
}

export interface StockOption {
    symbol: string;
    name: string;
}

export interface CategoryStocks {
    [key: string]: StockOption[];
}

export interface StockBreakdown {
    symbol: string;
    name: string;
    shares: number;
    currentPrice: number;
    historicalPrice: number;
    currentValue: number;
    historicalValue: number;
    return: number;
    returnPercentage: number;
}

export interface BasketCalculation {
    stocks: BasketStock[];
    timePeriod: TimePeriod;
    fromDate: string; // The historical date used for calculation
    currentValue: number;
    historicalValue: number;
    totalReturn: number;
    returnPercentage: number;
    breakdown: StockBreakdown[];
    calculatedAt: number;
}

export interface HistoricalPriceData {
    symbol: string;
    currentPrice: number;
    historicalPrice: number;
    date: string;
}
