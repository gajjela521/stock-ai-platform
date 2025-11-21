import { CategoryStocks } from "@/types/basket";

export const STOCK_CATEGORIES: CategoryStocks = {
    Technology: [
        { symbol: "AAPL", name: "Apple Inc." },
        { symbol: "MSFT", name: "Microsoft Corporation" },
        { symbol: "GOOGL", name: "Alphabet Inc." },
        { symbol: "NVDA", name: "NVIDIA Corporation" },
        { symbol: "META", name: "Meta Platforms Inc." }
    ],
    Finance: [
        { symbol: "JPM", name: "JPMorgan Chase & Co." },
        { symbol: "BAC", name: "Bank of America Corp." },
        { symbol: "GS", name: "Goldman Sachs Group Inc." },
        { symbol: "WFC", name: "Wells Fargo & Company" },
        { symbol: "MS", name: "Morgan Stanley" }
    ],
    Healthcare: [
        { symbol: "JNJ", name: "Johnson & Johnson" },
        { symbol: "UNH", name: "UnitedHealth Group Inc." },
        { symbol: "PFE", name: "Pfizer Inc." },
        { symbol: "ABBV", name: "AbbVie Inc." },
        { symbol: "MRK", name: "Merck & Co. Inc." }
    ],
    Consumer: [
        { symbol: "AMZN", name: "Amazon.com Inc." },
        { symbol: "WMT", name: "Walmart Inc." },
        { symbol: "HD", name: "Home Depot Inc." },
        { symbol: "NKE", name: "NIKE Inc." },
        { symbol: "SBUX", name: "Starbucks Corporation" }
    ],
    Energy: [
        { symbol: "XOM", name: "Exxon Mobil Corporation" },
        { symbol: "CVX", name: "Chevron Corporation" },
        { symbol: "COP", name: "ConocoPhillips" },
        { symbol: "SLB", name: "Schlumberger Limited" },
        { symbol: "EOG", name: "EOG Resources Inc." }
    ]
};

export const CATEGORY_ORDER = ["Technology", "Finance", "Healthcare", "Consumer", "Energy"];
