import { FMP_BASE_URL, FMP_ENDPOINTS } from "./constants";

export interface SP500Stock {
    symbol: string;
    name: string;
    sector: string;
    subSector: string;
    headQuarter: string;
    dateFirstAdded: string;
    cik: string;
    founded: string;
}

export interface TreemapStock {
    symbol: string;
    name: string;
    marketCap: number;
    changePercent: number;
    price: number;
    sector: string;
}

export interface TreemapRect {
    x: number;
    y: number;
    width: number;
    height: number;
    stock: TreemapStock;
}

// Fetch S&P 500 constituent list
export async function fetchSP500Constituents(): Promise<SP500Stock[]> {
    const apiKey = process.env.NEXT_PUBLIC_FMP_API_KEY;
    if (!apiKey) return [];

    try {
        const url = `${FMP_BASE_URL}${FMP_ENDPOINTS.SP500_CONSTITUENT()}?apikey=${apiKey}`;
        const response = await fetch(url);
        if (!response.ok) return [];
        const data = await response.json();
        return data || [];
    } catch (error) {
        console.error("Error fetching S&P 500 constituents:", error);
        return [];
    }
}

// Fetch batch quotes for multiple symbols
export async function fetchBatchQuotes(symbols: string[]): Promise<TreemapStock[]> {
    const apiKey = process.env.NEXT_PUBLIC_FMP_API_KEY;
    if (!apiKey) return [];

    try {
        // Split into chunks of 100 symbols (API limit)
        const chunks: string[][] = [];
        for (let i = 0; i < symbols.length; i += 100) {
            chunks.push(symbols.slice(i, i + 100));
        }

        const allQuotes: any[] = [];
        for (const chunk of chunks) {
            const symbolList = chunk.join(",");
            const url = `${FMP_BASE_URL}${FMP_ENDPOINTS.BATCH_QUOTE()}/${symbolList}?apikey=${apiKey}`;
            const response = await fetch(url);
            if (!response.ok) continue;
            const data = await response.json();
            if (Array.isArray(data)) {
                allQuotes.push(...data);
            }
        }

        return allQuotes.map(quote => ({
            symbol: quote.symbol,
            name: quote.name,
            marketCap: quote.marketCap || 0,
            changePercent: quote.changesPercentage || 0,
            price: quote.price || 0,
            sector: "", // Will be filled from constituents
        }));
    } catch (error) {
        console.error("Error fetching batch quotes:", error);
        return [];
    }
}

// Fetch S&P 500 market data (combined)
export async function fetchSP500MarketData(): Promise<TreemapStock[]> {
    const apiKey = process.env.NEXT_PUBLIC_FMP_API_KEY;

    // If no API key, return mock data
    if (!apiKey) {
        console.log("No API key, using mock data");
        return getMockSP500Data();
    }

    try {
        const constituents = await fetchSP500Constituents();

        if (constituents.length === 0) {
            console.log("No constituents found, using mock data");
            return getMockSP500Data();
        }

        console.log(`Fetched ${constituents.length} S&P 500 constituents`);

        const symbols = constituents.map(c => c.symbol);
        const quotes = await fetchBatchQuotes(symbols);

        if (quotes.length === 0) {
            console.log("No quotes found, using mock data");
            return getMockSP500Data();
        }

        console.log(`Fetched ${quotes.length} stock quotes`);

        // Merge sector information
        const sectorMap = new Map(constituents.map(c => [c.symbol, c.sector]));
        const result = quotes.map(quote => ({
            ...quote,
            sector: sectorMap.get(quote.symbol) || "Unknown",
        })).filter(stock => stock.marketCap > 0); // Filter out invalid data

        console.log(`Returning ${result.length} stocks with valid data`);
        return result.length > 0 ? result : getMockSP500Data();
    } catch (error) {
        console.error("Error fetching S&P 500 data:", error);
        return getMockSP500Data();
    }
}

// Squarified Treemap Layout Algorithm
export function calculateTreemapLayout(
    stocks: TreemapStock[],
    width: number,
    height: number
): TreemapRect[] {
    if (stocks.length === 0 || width <= 0 || height <= 0) return [];

    // Sort by market cap (descending)
    const sortedStocks = [...stocks].sort((a, b) => b.marketCap - a.marketCap);

    // Calculate total market cap
    const totalMarketCap = sortedStocks.reduce((sum, stock) => sum + stock.marketCap, 0);

    // Normalize areas
    const items = sortedStocks.map(stock => ({
        stock,
        value: stock.marketCap,
        normalizedValue: (stock.marketCap / totalMarketCap) * width * height,
    }));

    const rects: TreemapRect[] = [];

    type TreemapItem = {
        stock: TreemapStock;
        value: number;
        normalizedValue: number;
    };

    // Squarified treemap implementation
    function squarify(
        items: TreemapItem[],
        x: number,
        y: number,
        w: number,
        h: number
    ): void {
        if (items.length === 0) return;

        if (items.length === 1) {
            rects.push({
                x,
                y,
                width: w,
                height: h,
                stock: items[0].stock,
            });
            return;
        }

        const totalValue = items.reduce((sum: number, item: TreemapItem) => sum + item.normalizedValue, 0);
        const isHorizontal = w >= h;

        // Find best split point
        let bestSplit = 1;
        let bestRatio = Infinity;

        for (let i = 1; i <= items.length; i++) {
            const rowValue = items.slice(0, i).reduce((sum: number, item: TreemapItem) => sum + item.normalizedValue, 0);
            const rowSize = isHorizontal ? (rowValue / totalValue) * w : (rowValue / totalValue) * h;

            // Calculate worst aspect ratio in this row
            let worstRatio = 0;
            for (let j = 0; j < i; j++) {
                const itemValue = items[j].normalizedValue;
                const itemSize = isHorizontal ?
                    (itemValue / rowValue) * h :
                    (itemValue / rowValue) * w;
                const ratio = Math.max(rowSize / itemSize, itemSize / rowSize);
                worstRatio = Math.max(worstRatio, ratio);
            }

            if (worstRatio < bestRatio) {
                bestRatio = worstRatio;
                bestSplit = i;
            } else {
                break; // Ratio getting worse, stop
            }
        }

        const row = items.slice(0, bestSplit);
        const remaining = items.slice(bestSplit);

        const rowValue = row.reduce((sum: number, item: TreemapItem) => sum + item.normalizedValue, 0);
        const rowSize = isHorizontal ? (rowValue / totalValue) * w : (rowValue / totalValue) * h;

        // Layout current row
        let offset = 0;
        for (const item of row) {
            const itemSize = isHorizontal ?
                (item.normalizedValue / rowValue) * h :
                (item.normalizedValue / rowValue) * w;

            if (isHorizontal) {
                rects.push({
                    x: x,
                    y: y + offset,
                    width: rowSize,
                    height: itemSize,
                    stock: item.stock,
                });
            } else {
                rects.push({
                    x: x + offset,
                    y: y,
                    width: itemSize,
                    height: rowSize,
                    stock: item.stock,
                });
            }
            offset += itemSize;
        }

        // Recursively layout remaining items
        if (remaining.length > 0) {
            if (isHorizontal) {
                squarify(remaining, x + rowSize, y, w - rowSize, h);
            } else {
                squarify(remaining, x, y + rowSize, w, h - rowSize);
            }
        }
    }

    squarify(items, 0, 0, width, height);
    return rects;
}

// Get color based on change percent
export function getStockColor(changePercent: number): string {
    if (changePercent > 5) return "rgb(0, 128, 0)"; // Dark green
    if (changePercent > 2) return "rgb(34, 197, 94)"; // Medium green
    if (changePercent > 0) return "rgb(134, 239, 172)"; // Light green
    if (changePercent === 0) return "rgb(156, 163, 175)"; // Gray
    if (changePercent > -2) return "rgb(252, 165, 165)"; // Light red
    if (changePercent > -5) return "rgb(239, 68, 68)"; // Medium red
    return "rgb(153, 27, 27)"; // Dark red
}

// Mock data for fallback (updated November 2024)
function getMockSP500Data(): TreemapStock[] {
    const mockStocks = [
        { symbol: "NVDA", name: "NVIDIA", marketCap: 3500000000000, changePercent: 3.50, price: 495.00, sector: "Technology" },
        { symbol: "AAPL", name: "Apple Inc.", marketCap: 3400000000000, changePercent: 1.25, price: 189.50, sector: "Technology" },
        { symbol: "MSFT", name: "Microsoft", marketCap: 3200000000000, changePercent: 0.85, price: 420.50, sector: "Technology" },
        { symbol: "GOOGL", name: "Alphabet", marketCap: 2100000000000, changePercent: -0.45, price: 175.30, sector: "Communication Services" },
        { symbol: "AMZN", name: "Amazon", marketCap: 2000000000000, changePercent: 2.10, price: 185.20, sector: "Consumer Cyclical" },
        { symbol: "META", name: "Meta Platforms", marketCap: 1400000000000, changePercent: 1.75, price: 485.00, sector: "Communication Services" },
        { symbol: "BRK.B", name: "Berkshire Hathaway", marketCap: 950000000000, changePercent: 0.35, price: 425.00, sector: "Financial Services" },
        { symbol: "TSLA", name: "Tesla", marketCap: 900000000000, changePercent: -2.88, price: 175.00, sector: "Consumer Cyclical" },
        { symbol: "JPM", name: "JPMorgan Chase", marketCap: 650000000000, changePercent: -0.65, price: 195.00, sector: "Financial Services" },
        { symbol: "V", name: "Visa", marketCap: 600000000000, changePercent: 0.95, price: 275.00, sector: "Financial Services" },
        { symbol: "WMT", name: "Walmart", marketCap: 550000000000, changePercent: 0.45, price: 165.00, sector: "Consumer Defensive" },
        { symbol: "XOM", name: "Exxon Mobil", marketCap: 500000000000, changePercent: -1.20, price: 115.00, sector: "Energy" },
        { symbol: "UNH", name: "UnitedHealth", marketCap: 480000000000, changePercent: 0.75, price: 520.00, sector: "Healthcare" },
        { symbol: "JNJ", name: "Johnson & Johnson", marketCap: 450000000000, changePercent: -0.35, price: 155.00, sector: "Healthcare" },
        { symbol: "MA", name: "Mastercard", marketCap: 420000000000, changePercent: 1.10, price: 450.00, sector: "Financial Services" },
        { symbol: "PG", name: "Procter & Gamble", marketCap: 400000000000, changePercent: 0.25, price: 165.00, sector: "Consumer Defensive" },
        { symbol: "HD", name: "Home Depot", marketCap: 380000000000, changePercent: -0.55, price: 350.00, sector: "Consumer Cyclical" },
        { symbol: "CVX", name: "Chevron", marketCap: 350000000000, changePercent: -1.50, price: 160.00, sector: "Energy" },
        { symbol: "ABBV", name: "AbbVie", marketCap: 330000000000, changePercent: 0.65, price: 175.00, sector: "Healthcare" },
        { symbol: "MRK", name: "Merck", marketCap: 320000000000, changePercent: 0.85, price: 125.00, sector: "Healthcare" },
    ];
    return mockStocks;
}
