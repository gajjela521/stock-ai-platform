// API Constants
export const FMP_BASE_URL = "https://financialmodelingprep.com/api/v3";

// API Endpoints
export const FMP_ENDPOINTS = {
    QUOTE: (symbol: string) => `/quote/${symbol}`,
    PROFILE: (symbol: string) => `/profile/${symbol}`,
    KEY_METRICS_TTM: (symbol: string) => `/key-metrics-ttm/${symbol}`,
    BALANCE_SHEET: (symbol: string) => `/balance-sheet-statement/${symbol}`,
    STOCK_NEWS: (symbol: string) => `/stock_news`,
    SEARCH: () => `/search`,
    MARKET_HOURS: () => `/market-hours`,
    SP500_CONSTITUENT: () => `/sp500_constituent`,
    BATCH_QUOTE: () => `/quote`,
} as const;

// Rate Limiting
export const RATE_LIMIT = {
    MAX_REQUESTS: 100,
    WINDOW_MS: 60 * 1000, // 1 minute
    STORAGE_KEY: "stock_api_rate_limit",
} as const;

// Default Values
export const DEFAULTS = {
    CURRENCY: "USD",
    SECTOR: "Unknown",
    INDUSTRY: "Unknown",
    DESCRIPTION: "No description available.",
} as const;

// Error Messages
export const ERROR_MESSAGES = {
    RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
    API_KEY_MISSING: "API key is not configured",
    SYMBOL_NOT_FOUND: "Stock symbol not found",
    NETWORK_ERROR: "Network error occurred",
    INVALID_RESPONSE: "Invalid API response",
} as const;
