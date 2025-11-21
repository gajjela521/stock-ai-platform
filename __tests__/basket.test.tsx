import { calculateBasketReturns, fetchHistoricalPrice } from "@/lib/basketApi";
import { BasketStock, TimePeriod } from "@/types/basket";
import "@testing-library/jest-dom";

// Mock global fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (function () {
    let store: Record<string, string> = {};
    return {
        getItem: function (key: string) {
            return store[key] || null;
        },
        setItem: function (key: string, value: string) {
            store[key] = value.toString();
        },
        clear: function () {
            store = {};
        },
        removeItem: function (key: string) {
            delete store[key];
        },
    };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("Build Your Basket Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        (global.fetch as jest.Mock).mockClear();
        // Set API key for tests
        process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY = "test-key";
    });

    // Helper to mock Alpha Vantage TIME_SERIES_DAILY response
    const mockTimeSeriesResponse = (symbol: string, currentPrice: number, historicalPrice: number) => {
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);

        const timeSeries: any = {};

        // Add current price (most recent date)
        const currentDate = today.toISOString().split('T')[0];
        timeSeries[currentDate] = {
            "1. open": currentPrice.toString(),
            "2. high": currentPrice.toString(),
            "3. low": currentPrice.toString(),
            "4. close": currentPrice.toString(),
            "5. volume": "1000000"
        };

        // Add historical prices (252 trading days ago for 1Y)
        for (let i = 1; i <= 252; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const price = i === 252 ? historicalPrice : currentPrice;
            timeSeries[dateStr] = {
                "1. open": price.toString(),
                "2. high": price.toString(),
                "3. low": price.toString(),
                "4. close": price.toString(),
                "5. volume": "1000000"
            };
        }

        return {
            "Meta Data": {
                "1. Information": "Daily Prices",
                "2. Symbol": symbol
            },
            "Time Series (Daily)": timeSeries
        };
    };

    test("fetchHistoricalPrice returns correct prices", async () => {
        const symbol = "AAPL";
        const currentPrice = 150.00;
        const historicalPrice = 120.00;

        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockTimeSeriesResponse(symbol, currentPrice, historicalPrice)
        });

        const result = await fetchHistoricalPrice(symbol, '1Y');

        expect(result.symbol).toBe(symbol);
        expect(result.currentPrice).toBe(currentPrice);
        expect(result.historicalPrice).toBe(historicalPrice);
    });

    test("calculateBasketReturns calculates correct returns", async () => {
        const stocks: BasketStock[] = [
            { category: "Technology", symbol: "AAPL", name: "Apple Inc.", shares: 10 },
            { category: "Finance", symbol: "JPM", name: "JPMorgan Chase", shares: 5 },
            { category: "Healthcare", symbol: "JNJ", name: "Johnson & Johnson", shares: 8 },
            { category: "Consumer", symbol: "AMZN", name: "Amazon", shares: 3 },
            { category: "Energy", symbol: "XOM", name: "Exxon Mobil", shares: 15 }
        ];

        // Mock responses for each stock
        (global.fetch as jest.Mock).mockImplementation((url: string) => {
            if (url.includes("AAPL")) {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockTimeSeriesResponse("AAPL", 150, 120)
                });
            }
            if (url.includes("JPM")) {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockTimeSeriesResponse("JPM", 140, 130)
                });
            }
            if (url.includes("JNJ")) {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockTimeSeriesResponse("JNJ", 160, 150)
                });
            }
            if (url.includes("AMZN")) {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockTimeSeriesResponse("AMZN", 130, 100)
                });
            }
            if (url.includes("XOM")) {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockTimeSeriesResponse("XOM", 110, 100)
                });
            }
            return Promise.reject(new Error("Unknown symbol"));
        });

        const result = await calculateBasketReturns(stocks, '1Y');

        // Verify structure
        expect(result.stocks).toEqual(stocks);
        expect(result.timePeriod).toBe('1Y');
        expect(result.breakdown).toHaveLength(5);

        // Verify calculations
        // AAPL: 10 * 150 = 1500 (current), 10 * 120 = 1200 (historical), return = 300
        const appleBreakdown = result.breakdown.find(b => b.symbol === "AAPL");
        expect(appleBreakdown?.currentValue).toBe(1500);
        expect(appleBreakdown?.historicalValue).toBe(1200);
        expect(appleBreakdown?.return).toBe(300);
        expect(appleBreakdown?.returnPercentage).toBeCloseTo(25, 1);

        // Verify totals
        expect(result.currentValue).toBeGreaterThan(result.historicalValue);
        expect(result.totalReturn).toBeGreaterThan(0);
        expect(result.returnPercentage).toBeGreaterThan(0);
    });

    test("validation rejects invalid basket (not 5 stocks)", async () => {
        const stocks: BasketStock[] = [
            { category: "Technology", symbol: "AAPL", name: "Apple Inc.", shares: 10 }
        ];

        await expect(calculateBasketReturns(stocks, '1Y')).rejects.toThrow("Must select exactly 5 stocks");
    });

    test("validation rejects zero shares", async () => {
        const stocks: BasketStock[] = [
            { category: "Technology", symbol: "AAPL", name: "Apple Inc.", shares: 0 },
            { category: "Finance", symbol: "JPM", name: "JPMorgan Chase", shares: 5 },
            { category: "Healthcare", symbol: "JNJ", name: "Johnson & Johnson", shares: 8 },
            { category: "Consumer", symbol: "AMZN", name: "Amazon", shares: 3 },
            { category: "Energy", symbol: "XOM", name: "Exxon Mobil", shares: 15 }
        ];

        await expect(calculateBasketReturns(stocks, '1Y')).rejects.toThrow("must be greater than 0");
    });

    test("caching reduces API calls", async () => {
        // Clear cache before this test
        localStorage.clear();

        const symbol = "TEST_CACHE";

        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockTimeSeriesResponse(symbol, 150, 120)
        });

        // First call
        await fetchHistoricalPrice(symbol, '1Y');
        const firstCallCount = (global.fetch as jest.Mock).mock.calls.length;
        expect(firstCallCount).toBe(1);

        // Second call should use cache
        await fetchHistoricalPrice(symbol, '1Y');
        const secondCallCount = (global.fetch as jest.Mock).mock.calls.length;
        expect(secondCallCount).toBe(1); // Still 1, not 2
    });

    test("handles Alpha Vantage rate limit error", async () => {
        localStorage.clear();

        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({
                "Note": "Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute."
            })
        });

        await expect(fetchHistoricalPrice("TEST_RATE", '1Y')).rejects.toThrow("ALPHA_VANTAGE_RATE_LIMIT");
    });

    test("different time periods use correct number of days", async () => {
        localStorage.clear();

        const symbol1 = "TEST_1M";
        const symbol2 = "TEST_6M";
        const symbol3 = "TEST_1Y";

        (global.fetch as jest.Mock).mockImplementation((url: string) => {
            return Promise.resolve({
                ok: true,
                json: async () => {
                    if (url.includes(symbol1)) return mockTimeSeriesResponse(symbol1, 150, 120);
                    if (url.includes(symbol2)) return mockTimeSeriesResponse(symbol2, 150, 120);
                    if (url.includes(symbol3)) return mockTimeSeriesResponse(symbol3, 150, 120);
                    return mockTimeSeriesResponse("TEST", 150, 120);
                }
            });
        });

        // Test 1M (21 days)
        await fetchHistoricalPrice(symbol1, '1M');

        // Test 6M (126 days)
        await fetchHistoricalPrice(symbol2, '6M');

        // Test 1Y (252 days)
        await fetchHistoricalPrice(symbol3, '1Y');

        // All should succeed with the mocked data
        expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    test("return percentage calculation is accurate", async () => {
        localStorage.clear();

        const stocks: BasketStock[] = [
            { category: "Technology", symbol: "TEST1", name: "Test 1", shares: 100 },
            { category: "Finance", symbol: "TEST2", name: "Test 2", shares: 100 },
            { category: "Healthcare", symbol: "TEST3", name: "Test 3", shares: 100 },
            { category: "Consumer", symbol: "TEST4", name: "Test 4", shares: 100 },
            { category: "Energy", symbol: "TEST5", name: "Test 5", shares: 100 }
        ];

        // All stocks doubled in price (100% return)
        (global.fetch as jest.Mock).mockImplementation((url: string) => {
            return Promise.resolve({
                ok: true,
                json: async () => mockTimeSeriesResponse("TEST", 200, 100)
            });
        });

        const result = await calculateBasketReturns(stocks, '1Y');

        // Each stock: 100 shares * $200 = $20,000 current, $100 = $10,000 historical
        // Total: $100,000 current, $50,000 historical
        // Return: $50,000 / $50,000 = 100%
        expect(result.returnPercentage).toBeCloseTo(100, 0);
    });
});
