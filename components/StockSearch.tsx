"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, TrendingUp, Globe } from "lucide-react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

interface Suggestion {
    symbol: string;
    name: string;
    exchange: string;
}

export function StockSearch() {
    const [symbol, setSymbol] = useState("");
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState("USA");
    const router = useRouter();
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedCountry !== "USA") {
            alert("Currently only USA stocks are supported. Other countries coming soon!");
            return;
        }

        if (symbol.trim()) {
            router.push(`/stock/${symbol.toUpperCase()}`);
            setShowSuggestions(false);
        }
    };

    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSymbol(value);

        if (value.length > 0 && selectedCountry === "USA") {
            // FMP Search API is not available on free tier (403 error)
            // Use local popular stocks list instead
            const popularStocks = [
                { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ" },
                { symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ" },
                { symbol: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ" },
                { symbol: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ" },
                { symbol: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ" },
                { symbol: "META", name: "Meta Platforms Inc.", exchange: "NASDAQ" },
                { symbol: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ" },
                { symbol: "BRK.B", name: "Berkshire Hathaway Inc.", exchange: "NYSE" },
                { symbol: "JPM", name: "JPMorgan Chase & Co.", exchange: "NYSE" },
                { symbol: "V", name: "Visa Inc.", exchange: "NYSE" },
                { symbol: "WMT", name: "Walmart Inc.", exchange: "NYSE" },
                { symbol: "JNJ", name: "Johnson & Johnson", exchange: "NYSE" },
                { symbol: "XOM", name: "Exxon Mobil Corporation", exchange: "NYSE" },
                { symbol: "UNH", name: "UnitedHealth Group Inc.", exchange: "NYSE" },
                { symbol: "MA", name: "Mastercard Inc.", exchange: "NYSE" },
                { symbol: "PG", name: "Procter & Gamble Co.", exchange: "NYSE" },
                { symbol: "HD", name: "The Home Depot Inc.", exchange: "NYSE" },
                { symbol: "CVX", name: "Chevron Corporation", exchange: "NYSE" },
                { symbol: "ABBV", name: "AbbVie Inc.", exchange: "NYSE" },
                { symbol: "MRK", name: "Merck & Co. Inc.", exchange: "NYSE" },
                { symbol: "KO", name: "The Coca-Cola Company", exchange: "NYSE" },
                { symbol: "PEP", name: "PepsiCo Inc.", exchange: "NASDAQ" },
                { symbol: "COST", name: "Costco Wholesale Corporation", exchange: "NASDAQ" },
                { symbol: "AVGO", name: "Broadcom Inc.", exchange: "NASDAQ" },
                { symbol: "ADBE", name: "Adobe Inc.", exchange: "NASDAQ" },
            ];

            const filtered = popularStocks.filter(stock =>
                stock.symbol.toLowerCase().includes(value.toLowerCase()) ||
                stock.name.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered.slice(0, 10));
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestionSymbol: string) => {
        if (selectedCountry !== "USA") {
            alert("Currently only USA stocks are supported. Other countries coming soon!");
            return;
        }
        setSymbol(suggestionSymbol);
        setShowSuggestions(false);
        router.push(`/stock/${suggestionSymbol}`);
    };

    const countries = [
        { code: "USA", name: "United States", flag: "🇺🇸", available: true },
        { code: "UK", name: "United Kingdom", flag: "🇬🇧", available: false },
        { code: "IN", name: "India", flag: "🇮🇳", available: false },
        { code: "CN", name: "China", flag: "🇨🇳", available: false },
        { code: "JP", name: "Japan", flag: "🇯🇵", available: false },
        { code: "DE", name: "Germany", flag: "🇩🇪", available: false },
    ];

    return (
        <Card className="p-6 shadow-lg">
            <div className="space-y-4">
                {/* Country Selector */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        <Globe className="w-4 h-4 inline mr-2" />
                        Select Market
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {countries.map((country) => (
                            <button
                                key={country.code}
                                onClick={() => {
                                    if (country.available) {
                                        setSelectedCountry(country.code);
                                    } else {
                                        alert(`${country.name} market coming soon!`);
                                    }
                                }}
                                disabled={!country.available}
                                className={`
                                    relative p-3 rounded-lg border-2 transition-all
                                    ${selectedCountry === country.code
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                        : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                                    }
                                    ${!country.available
                                        ? "opacity-50 cursor-not-allowed"
                                        : "cursor-pointer"
                                    }
                                `}
                            >
                                <div className="text-2xl mb-1">{country.flag}</div>
                                <div className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                    {country.code}
                                </div>
                                {!country.available && (
                                    <div className="absolute top-1 right-1 text-[10px] bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-1 rounded">
                                        Soon
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search Input */}
                <div className="relative" ref={searchRef}>
                    <form onSubmit={handleSubmit}>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                            <input
                                type="text"
                                value={symbol}
                                onChange={handleInputChange}
                                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                placeholder={selectedCountry === "USA" ? "Search stocks (e.g., AAPL, MSFT)..." : "Select USA market to search"}
                                disabled={selectedCountry !== "USA"}
                                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-blue-500 focus:outline-none bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                            )}
                </div>
            </div>
            <Button type="submit" className="w-full bg-neutral-900 hover:bg-neutral-800 text-white">
                Analyze Stock
            </Button>
        </form>
            </CardContent >
        </Card >
    );
}
