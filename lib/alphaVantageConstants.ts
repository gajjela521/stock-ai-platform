export const ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query";

export const ALPHA_VANTAGE_FUNCTIONS = {
    GLOBAL_QUOTE: "GLOBAL_QUOTE",
    OVERVIEW: "OVERVIEW",
    TIME_SERIES_DAILY: "TIME_SERIES_DAILY",
    NEWS_SENTIMENT: "NEWS_SENTIMENT",
    BALANCE_SHEET: "BALANCE_SHEET",
    INCOME_STATEMENT: "INCOME_STATEMENT",
    CASH_FLOW: "CASH_FLOW",
    EARNINGS: "EARNINGS",
} as const;

// Rate limiting for Alpha Vantage free tier
export const ALPHA_VANTAGE_RATE_LIMIT = {
    REQUESTS_PER_MINUTE: 5,
    REQUESTS_PER_DAY: 25,
} as const;

// Cache duration (5 minutes to minimize API calls)
export const CACHE_DURATION_MS = 5 * 60 * 1000;
