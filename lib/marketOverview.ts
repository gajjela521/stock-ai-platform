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
    const constituents = await fetchSP500Constituents();
    if (constituents.length === 0) return getMockSP500Data();

    const symbols = constituents.map(c => c.symbol);
    const quotes = await fetchBatchQuotes(symbols);

    // Merge sector information
    const sectorMap = new Map(constituents.map(c => [c.symbol, c.sector]));
    return quotes.map(quote => ({
        ...quote,
        sector: sectorMap.get(quote.symbol) || "Unknown",
    })).filter(stock => stock.marketCap > 0); // Filter out invalid data
}

// Squarified Treemap Layout Algorithm
export function calculateTreemapLayout(
    stocks: TreemapStock[],
    width: number,
    height: number
): TreemapRect[] {
    if (stocks.length === 0) return [];

    // Sort by market cap (descending)
    const sortedStocks = [...stocks].sort((a, b) => b.marketCap - a.marketCap);

    // Calculate total market cap
    const totalMarketCap = sortedStocks.reduce((sum, stock) => sum + stock.marketCap, 0);

    // Normalize areas
    const normalizedStocks = sortedStocks.map(stock => ({
        stock,
        area: (stock.marketCap / totalMarketCap) * width * height,
    }));

    // Simple row-based layout (not fully squarified but simpler)
    const rects: TreemapRect[] = [];
    let currentX = 0;
    let currentY = 0;
    let rowHeight = 0;
    let rowWidth = 0;
    const rowStocks: typeof normalizedStocks = [];

    for (let i = 0; i < normalizedStocks.length; i++) {
        const item = normalizedStocks[i];
        rowStocks.push(item);

        const rowArea = rowStocks.reduce((sum, s) => sum + s.area, 0);
        const proposedRowHeight = rowArea / width;

        // Check if we should start a new row
        const shouldBreak =
            i === normalizedStocks.length - 1 ||
            currentY + proposedRowHeight > height ||
            rowStocks.length > 10; // Max items per row

        if (shouldBreak) {
            // Layout current row
            rowHeight = Math.min(proposedRowHeight, height - currentY);
            rowWidth = 0;

            for (const rowItem of rowStocks) {
                const rectWidth = (rowItem.area / rowArea) * width;
                rects.push({
                    x: currentX + rowWidth,
                    y: currentY,
                    width: rectWidth,
                    height: rowHeight,
                    stock: rowItem.stock,
                });
                rowWidth += rectWidth;
            }

            currentY += rowHeight;
            currentX = 0;
            rowStocks.length = 0;
        }
    }

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

// Mock data for fallback
function getMockSP500Data(): TreemapStock[] {
    const mockStocks = [
        { symbol: "AAPL", name: "Apple Inc.", marketCap: 2950000000000, changePercent: 1.25, price: 189.50, sector: "Technology" },
        { symbol: "MSFT", name: "Microsoft", marketCap: 2800000000000, changePercent: 0.85, price: 420.50, sector: "Technology" },
        { symbol: "GOOGL", name: "Alphabet", marketCap: 1750000000000, changePercent: -0.45, price: 175.30, sector: "Communication Services" },
        { symbol: "AMZN", name: "Amazon", marketCap: 1650000000000, changePercent: 2.10, price: 185.20, sector: "Consumer Cyclical" },
        { symbol: "NVDA", name: "NVIDIA", marketCap: 1450000000000, changePercent: 3.50, price: 495.00, sector: "Technology" },
        { symbol: "TSLA", name: "Tesla", marketCap: 850000000000, changePercent: -2.88, price: 175.00, sector: "Consumer Cyclical" },
        { symbol: "META", name: "Meta Platforms", marketCap: 950000000000, changePercent: 1.75, price: 485.00, sector: "Communication Services" },
        { symbol: "BRK.B", name: "Berkshire Hathaway", marketCap: 900000000000, changePercent: 0.35, price: 425.00, sector: "Financial Services" },
        { symbol: "JPM", name: "JPMorgan Chase", marketCap: 550000000000, changePercent: -0.65, price: 195.00, sector: "Financial Services" },
        { symbol: "V", name: "Visa", marketCap: 520000000000, changePercent: 0.95, price: 275.00, sector: "Financial Services" },
    ];
    return mockStocks;
}
