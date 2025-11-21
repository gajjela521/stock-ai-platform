import { ALPHA_VANTAGE_BASE_URL, ALPHA_VANTAGE_FUNCTIONS, CACHE_DURATION_MS } from "./alphaVantageConstants";
import { BasketStock, BasketCalculation, StockBreakdown, HistoricalPriceData, TimePeriod } from "@/types/basket";
import { canMakeRequest, recordAPIRequest } from "./apiUsageTracker";

// Extended cache duration for historical data (24 hours since it doesn't change)
const HISTORICAL_CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

// In-memory cache for historical prices
const historicalCache = new Map<string, { data: any; timestamp: number }>();

function getFromHistoricalCache(key: string): any | null {
    const cached = historicalCache.get(key);
    if (cached && Date.now() - cached.timestamp < HISTORICAL_CACHE_DURATION_MS) {
        return cached.data;
    }
    historicalCache.delete(key);
    return null;
}

function setHistoricalCache(key: string, data: any): void {
    historicalCache.set(key, { data, timestamp: Date.now() });
}

// Map time periods to trading days
const TRADING_DAYS: Record<TimePeriod, number> = {
    '1M': 21,   // ~1 month
    '6M': 126,  // ~6 months
    '1Y': 252   // ~1 year
};

/**
 * Fetch historical daily prices for a stock
 */
async function fetchDailyTimeSeries(symbol: string): Promise<any> {
    const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY_NOT_CONFIGURED: Alpha Vantage API key not configured");
    }

    const cacheKey = `daily_${symbol}`;
    const cached = getFromHistoricalCache(cacheKey);
    if (cached) {
        console.log(`✅ Returning cached historical data for: ${symbol}`);
        return cached;
    }

    // Check rate limit
    const usageCheck = canMakeRequest();
    if (!usageCheck.allowed) {
        throw new Error(`API_LIMIT_EXCEEDED: ${usageCheck.reason}`);
    }

    try {
        const url = new URL(ALPHA_VANTAGE_BASE_URL);
        url.searchParams.append('function', ALPHA_VANTAGE_FUNCTIONS.TIME_SERIES_DAILY);
        url.searchParams.append('symbol', symbol);
        url.searchParams.append('apikey', apiKey);
        url.searchParams.append('outputsize', 'full'); // Get full history

        console.log(`🔄 Fetching historical data for: ${symbol}`);
        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Check for errors
        if (data["Error Message"]) {
            throw new Error(data["Error Message"]);
        }

        if (data["Note"]) {
            throw new Error(
                "ALPHA_VANTAGE_RATE_LIMIT: Alpha Vantage API limit reached. " +
                "Wait 1 minute (per-minute limit) or until tomorrow (daily limit)."
            );
        }

        // Only record if successful
        recordAPIRequest();

        setHistoricalCache(cacheKey, data);
        console.log(`✅ Historical data fetched and cached for: ${symbol}`);
        return data;
    } catch (error: any) {
        console.error(`❌ Error fetching historical data for ${symbol}:`, error);
        throw error;
    }
}

/**
 * Get price from X trading days ago
 */
function getPriceFromDaysAgo(timeSeriesData: any, daysAgo: number): number | null {
    const timeSeries = timeSeriesData["Time Series (Daily)"];
    if (!timeSeries) {
        return null;
    }

    const dates = Object.keys(timeSeries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    // Get price from daysAgo trading days back
    if (dates.length > daysAgo) {
        const targetDate = dates[daysAgo];
        const priceData = timeSeries[targetDate];
        return parseFloat(priceData["4. close"]);
    }

    return null;
}

/**
 * Get current price (most recent close)
 */
function getCurrentPrice(timeSeriesData: any): number | null {
    const timeSeries = timeSeriesData["Time Series (Daily)"];
    if (!timeSeries) {
        return null;
    }

    const dates = Object.keys(timeSeries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    if (dates.length > 0) {
        const latestDate = dates[0];
        const priceData = timeSeries[latestDate];
        return parseFloat(priceData["4. close"]);
    }

    return null;
}

/**
 * Fetch historical price data for a stock
 */
export async function fetchHistoricalPrice(symbol: string, timePeriod: TimePeriod): Promise<HistoricalPriceData> {
    const timeSeriesData = await fetchDailyTimeSeries(symbol);
    const daysAgo = TRADING_DAYS[timePeriod];

    const currentPrice = getCurrentPrice(timeSeriesData);
    const historicalPrice = getPriceFromDaysAgo(timeSeriesData, daysAgo);

    if (currentPrice === null || historicalPrice === null) {
        throw new Error(`Unable to fetch price data for ${symbol}`);
    }

    const timeSeries = timeSeriesData["Time Series (Daily)"];
    const dates = Object.keys(timeSeries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const historicalDate = dates[daysAgo] || dates[dates.length - 1];

    return {
        symbol,
        currentPrice,
        historicalPrice,
        date: historicalDate
    };
}

/**
 * Calculate basket returns
 */
export async function calculateBasketReturns(
    stocks: BasketStock[],
    timePeriod: TimePeriod
): Promise<BasketCalculation> {
    // Validate input
    if (stocks.length !== 5) {
        throw new Error("VALIDATION_ERROR: Must select exactly 5 stocks (one from each category)");
    }

    for (const stock of stocks) {
        if (stock.shares <= 0) {
            throw new Error(`VALIDATION_ERROR: Shares for ${stock.symbol} must be greater than 0`);
        }
    }

    // Fetch historical prices for all stocks in parallel
    console.log(`📊 Calculating basket returns for ${timePeriod}...`);
    const priceDataPromises = stocks.map(stock =>
        fetchHistoricalPrice(stock.symbol, timePeriod)
    );

    const priceData = await Promise.all(priceDataPromises);

    // Calculate breakdown for each stock
    const breakdown: StockBreakdown[] = stocks.map((stock, index) => {
        const prices = priceData[index];
        const currentValue = stock.shares * prices.currentPrice;
        const historicalValue = stock.shares * prices.historicalPrice;
        const returnAmount = currentValue - historicalValue;
        const returnPercentage = (returnAmount / historicalValue) * 100;

        return {
            symbol: stock.symbol,
            name: stock.name,
            shares: stock.shares,
            currentPrice: prices.currentPrice,
            historicalPrice: prices.historicalPrice,
            currentValue,
            historicalValue,
            return: returnAmount,
            returnPercentage
        };
    });

    // Calculate totals
    const currentValue = breakdown.reduce((sum, item) => sum + item.currentValue, 0);
    const historicalValue = breakdown.reduce((sum, item) => sum + item.historicalValue, 0);
    const totalReturn = currentValue - historicalValue;
    const returnPercentage = (totalReturn / historicalValue) * 100;

    console.log(`✅ Basket calculation complete. Total return: ${returnPercentage.toFixed(2)}%`);

    return {
        stocks,
        timePeriod,
        currentValue,
        historicalValue,
        totalReturn,
        returnPercentage,
        breakdown,
        calculatedAt: Date.now()
    };
}
