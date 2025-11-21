// API Usage Tracking
const USAGE_STORAGE_KEY = "alpha_vantage_usage";
const DAILY_LIMIT = 25;
const MINUTE_LIMIT = 5;

interface APIUsage {
    dailyCount: number;
    dailyResetTime: number;
    minuteRequests: number[];
}

export function getAPIUsage(): APIUsage {
    if (typeof window === "undefined") {
        return { dailyCount: 0, dailyResetTime: Date.now() + 24 * 60 * 60 * 1000, minuteRequests: [] };
    }

    const stored = localStorage.getItem(USAGE_STORAGE_KEY);
    if (!stored) {
        const newUsage: APIUsage = {
            dailyCount: 0,
            dailyResetTime: Date.now() + 24 * 60 * 60 * 1000,
            minuteRequests: [],
        };
        localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(newUsage));
        return newUsage;
    }

    const usage: APIUsage = JSON.parse(stored);

    // Reset daily count if time has passed
    if (Date.now() > usage.dailyResetTime) {
        usage.dailyCount = 0;
        usage.dailyResetTime = Date.now() + 24 * 60 * 60 * 1000;
        usage.minuteRequests = [];
        localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(usage));
    }

    // Clean up old minute requests (older than 1 minute)
    const oneMinuteAgo = Date.now() - 60 * 1000;
    const oldLength = usage.minuteRequests.length;
    usage.minuteRequests = usage.minuteRequests.filter(time => time > oneMinuteAgo);

    // Save back to localStorage if we cleaned up any old requests
    if (oldLength !== usage.minuteRequests.length) {
        localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(usage));
    }

    return usage;
}


export function canMakeRequest(): { allowed: boolean; reason?: string; resetIn?: number } {
    const usage = getAPIUsage();
    const now = Date.now();

    // Check daily limit
    if (usage.dailyCount >= DAILY_LIMIT) {
        const resetIn = Math.ceil((usage.dailyResetTime - now) / 1000);
        return {
            allowed: false,
            reason: `Daily limit of ${DAILY_LIMIT} requests reached`,
            resetIn,
        };
    }

    // Check per-minute limit
    const oneMinuteAgo = now - 60 * 1000;
    const recentRequests = usage.minuteRequests.filter(time => time > oneMinuteAgo);
    if (recentRequests.length >= MINUTE_LIMIT) {
        return {
            allowed: false,
            reason: `Rate limit of ${MINUTE_LIMIT} requests per minute reached`,
            resetIn: 60,
        };
    }

    return { allowed: true };
}

export function recordAPIRequest(): void {
    if (typeof window === "undefined") return;

    const usage = getAPIUsage();
    const now = Date.now();

    usage.dailyCount++;
    usage.minuteRequests.push(now);

    // Keep only last minute of requests
    const oneMinuteAgo = now - 60 * 1000;
    usage.minuteRequests = usage.minuteRequests.filter(time => time > oneMinuteAgo);

    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(usage));
}

export function undoAPIRequest(): void {
    if (typeof window === "undefined") return;

    const usage = getAPIUsage();

    // Remove the last request if it exists
    if (usage.dailyCount > 0) {
        usage.dailyCount--;
    }

    // Remove the most recent minute request
    if (usage.minuteRequests.length > 0) {
        usage.minuteRequests.pop();
    }

    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(usage));
}


export function getUsageStats(): {
    dailyUsed: number;
    dailyLimit: number;
    dailyRemaining: number;
    minuteUsed: number;
    minuteLimit: number;
    minuteRemaining: number;
    resetIn: number;
} {
    const usage = getAPIUsage();
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const recentRequests = usage.minuteRequests.filter(time => time > oneMinuteAgo);

    return {
        dailyUsed: usage.dailyCount,
        dailyLimit: DAILY_LIMIT,
        dailyRemaining: Math.max(0, DAILY_LIMIT - usage.dailyCount),
        minuteUsed: recentRequests.length,
        minuteLimit: MINUTE_LIMIT,
        minuteRemaining: Math.max(0, MINUTE_LIMIT - recentRequests.length),
        resetIn: Math.ceil((usage.dailyResetTime - now) / 1000),
    };
}

export function resetUsage(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(USAGE_STORAGE_KEY);
}
