import { FMP_BASE_URL, FMP_ENDPOINTS } from "./constants";
import { APIEndpointStatus, ServiceHealth } from "@/types/service";

// Check individual endpoint health
async function checkEndpoint(
    name: string,
    url: string,
    timeout: number = 5000
): Promise<APIEndpointStatus> {
    const startTime = Date.now();

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
            signal: controller.signal,
            method: 'GET',
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        if (!response.ok) {
            const errorText = await response.text();
            return {
                name,
                endpoint: url,
                status: "inactive",
                responseTime,
                lastChecked: new Date(),
                error: `HTTP ${response.status}: ${response.statusText}`,
                details: errorText.substring(0, 200),
            };
        }

        const data = await response.json();

        // Check if response has expected structure
        if (data.Error || data.error || data["Error Message"]) {
            return {
                name,
                endpoint: url,
                status: "inactive",
                responseTime,
                lastChecked: new Date(),
                error: data.Error || data.error || data["Error Message"],
                details: JSON.stringify(data).substring(0, 200),
            };
        }

        return {
            name,
            endpoint: url,
            status: responseTime > 2000 ? "degraded" : "active",
            responseTime,
            lastChecked: new Date(),
        };
    } catch (error: any) {
        const responseTime = Date.now() - startTime;
        return {
            name,
            endpoint: url,
            status: "inactive",
            responseTime,
            lastChecked: new Date(),
            error: error.name === 'AbortError' ? 'Request timeout' : error.message,
            details: error.stack?.substring(0, 200),
        };
    }
}

// Check all FMP API endpoints
export async function checkServiceHealth(): Promise<ServiceHealth> {
    const apiKey = process.env.NEXT_PUBLIC_FMP_API_KEY;

    if (!apiKey) {
        return {
            overall: "down",
            endpoints: [],
            apiKeyConfigured: false,
            lastUpdated: new Date(),
        };
    }

    // Test endpoints
    const endpointsToCheck = [
        {
            name: "Stock Quote (AAPL)",
            url: `${FMP_BASE_URL}${FMP_ENDPOINTS.QUOTE("AAPL")}?apikey=${apiKey}`,
        },
        {
            name: "Company Profile (AAPL)",
            url: `${FMP_BASE_URL}${FMP_ENDPOINTS.PROFILE("AAPL")}?apikey=${apiKey}`,
        },
        {
            name: "Key Metrics (AAPL)",
            url: `${FMP_BASE_URL}${FMP_ENDPOINTS.KEY_METRICS_TTM("AAPL")}?apikey=${apiKey}`,
        },
        {
            name: "S&P 500 Constituents",
            url: `${FMP_BASE_URL}${FMP_ENDPOINTS.SP500_CONSTITUENT()}?apikey=${apiKey}`,
        },
        {
            name: "Market Hours",
            url: `${FMP_BASE_URL}${FMP_ENDPOINTS.MARKET_HOURS()}?apikey=${apiKey}`,
        },
        {
            name: "Search",
            url: `${FMP_BASE_URL}${FMP_ENDPOINTS.SEARCH()}?query=AAPL&limit=5&apikey=${apiKey}`,
        },
    ];

    // Check all endpoints in parallel
    const results = await Promise.all(
        endpointsToCheck.map(({ name, url }) => checkEndpoint(name, url))
    );

    // Determine overall health
    const activeCount = results.filter(r => r.status === "active").length;
    const degradedCount = results.filter(r => r.status === "degraded").length;
    const inactiveCount = results.filter(r => r.status === "inactive").length;

    let overall: "healthy" | "degraded" | "down";
    if (inactiveCount === results.length) {
        overall = "down";
    } else if (inactiveCount > 0 || degradedCount > results.length / 2) {
        overall = "degraded";
    } else {
        overall = "healthy";
    }

    return {
        overall,
        endpoints: results,
        apiKeyConfigured: true,
        lastUpdated: new Date(),
    };
}

// Get status badge color
export function getStatusColor(status: APIEndpointStatus["status"]): string {
    switch (status) {
        case "active":
            return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
        case "degraded":
            return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
        case "inactive":
            return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
        case "checking":
            return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    }
}

// Get overall status color
export function getOverallStatusColor(status: ServiceHealth["overall"]): string {
    switch (status) {
        case "healthy":
            return "text-green-600 dark:text-green-400";
        case "degraded":
            return "text-yellow-600 dark:text-yellow-400";
        case "down":
            return "text-red-600 dark:text-red-400";
    }
}
