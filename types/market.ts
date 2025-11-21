// Market Data Types

export interface StockMover {
    ticker: string;
    price: string;
    change_amount: string;
    change_percentage: string;
    volume: string;
}

export interface MarketMoversData {
    metadata: string;
    last_updated: string;
    top_gainers: StockMover[];
    top_losers: StockMover[];
    most_actively_traded: StockMover[];
}
