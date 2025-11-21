"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, TrendingUp, Globe } from "lucide-react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { useTestMode } from "@/contexts/TestModeContext";
import { MOCK_SEARCH_RESULTS } from "@/lib/mockData";

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
    const { isTestMode } = useTestMode();

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
            router.push(`/analysis?symbol=${symbol.toUpperCase()}`);
            setShowSuggestions(false);
        }
    };

    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSymbol(value);

        if (value.length > 0 && selectedCountry === "USA") {
            let results: Suggestion[] = [];

            if (isTestMode) {
                // Use mock data in test mode
                results = MOCK_SEARCH_RESULTS.filter(stock =>
                    stock.symbol.toLowerCase().includes(value.toLowerCase()) ||
                    stock.name.toLowerCase().includes(value.toLowerCase())
                ).map(stock => ({
                    symbol: stock.symbol,
                    name: stock.name,
                    exchange: stock.exchange || "NASDAQ" // Default to NASDAQ if missing
                }));
            } else {
                // Use local popular stocks list for live mode (since FMP search is paid)
                const popularStocks = [
                    // Tech Giants
                    { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ" },
                    { symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ" },
                    { symbol: "GOOGL", name: "Alphabet Inc. Class A", exchange: "NASDAQ" },
                    { symbol: "GOOG", name: "Alphabet Inc. Class C", exchange: "NASDAQ" },
                    { symbol: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ" },
                    { symbol: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ" },
                    { symbol: "META", name: "Meta Platforms Inc.", exchange: "NASDAQ" },
                    { symbol: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ" },
                    { symbol: "AVGO", name: "Broadcom Inc.", exchange: "NASDAQ" },
                    { symbol: "ORCL", name: "Oracle Corporation", exchange: "NYSE" },
                    { symbol: "ADBE", name: "Adobe Inc.", exchange: "NASDAQ" },
                    { symbol: "CRM", name: "Salesforce Inc.", exchange: "NYSE" },
                    { symbol: "NFLX", name: "Netflix Inc.", exchange: "NASDAQ" },
                    { symbol: "AMD", name: "Advanced Micro Devices Inc.", exchange: "NASDAQ" },
                    { symbol: "INTC", name: "Intel Corporation", exchange: "NASDAQ" },
                    { symbol: "CSCO", name: "Cisco Systems Inc.", exchange: "NASDAQ" },
                    { symbol: "QCOM", name: "QUALCOMM Inc.", exchange: "NASDAQ" },

                    // Finance
                    { symbol: "BRK.B", name: "Berkshire Hathaway Inc. Class B", exchange: "NYSE" },
                    { symbol: "JPM", name: "JPMorgan Chase & Co.", exchange: "NYSE" },
                    { symbol: "V", name: "Visa Inc.", exchange: "NYSE" },
                    { symbol: "MA", name: "Mastercard Inc.", exchange: "NYSE" },
                    { symbol: "BAC", name: "Bank of America Corp.", exchange: "NYSE" },
                    { symbol: "WFC", name: "Wells Fargo & Co.", exchange: "NYSE" },
                    { symbol: "GS", name: "Goldman Sachs Group Inc.", exchange: "NYSE" },
                    { symbol: "MS", name: "Morgan Stanley", exchange: "NYSE" },
                    { symbol: "AXP", name: "American Express Co.", exchange: "NYSE" },

                    // Consumer & Retail
                    { symbol: "WMT", name: "Walmart Inc.", exchange: "NYSE" },
                    { symbol: "COST", name: "Costco Wholesale Corporation", exchange: "NASDAQ" },
                    { symbol: "HD", name: "The Home Depot Inc.", exchange: "NYSE" },
                    { symbol: "MCD", name: "McDonald's Corporation", exchange: "NYSE" },
                    { symbol: "NKE", name: "NIKE Inc.", exchange: "NYSE" },
                    { symbol: "SBUX", name: "Starbucks Corporation", exchange: "NASDAQ" },
                    { symbol: "TGT", name: "Target Corporation", exchange: "NYSE" },
                    { symbol: "LOW", name: "Lowe's Companies Inc.", exchange: "NYSE" },

                    // Healthcare & Pharma
                    { symbol: "JNJ", name: "Johnson & Johnson", exchange: "NYSE" },
                    { symbol: "UNH", name: "UnitedHealth Group Inc.", exchange: "NYSE" },
                    { symbol: "PFE", name: "Pfizer Inc.", exchange: "NYSE" },
                    { symbol: "ABBV", name: "AbbVie Inc.", exchange: "NYSE" },
                    { symbol: "MRK", name: "Merck & Co. Inc.", exchange: "NYSE" },
                    { symbol: "LLY", name: "Eli Lilly and Co.", exchange: "NYSE" },
                    { symbol: "TMO", name: "Thermo Fisher Scientific Inc.", exchange: "NYSE" },

                    // Consumer Goods
                    { symbol: "PG", name: "Procter & Gamble Co.", exchange: "NYSE" },
                    { symbol: "KO", name: "The Coca-Cola Company", exchange: "NYSE" },
                    { symbol: "PEP", name: "PepsiCo Inc.", exchange: "NASDAQ" },

                    // Energy
                    { symbol: "XOM", name: "Exxon Mobil Corporation", exchange: "NYSE" },
                    { symbol: "CVX", name: "Chevron Corporation", exchange: "NYSE" },
                    { symbol: "COP", name: "ConocoPhillips", exchange: "NYSE" },

                    // Industrial
                    { symbol: "BA", name: "Boeing Co.", exchange: "NYSE" },
                    { symbol: "CAT", name: "Caterpillar Inc.", exchange: "NYSE" },
                    { symbol: "GE", name: "General Electric Co.", exchange: "NYSE" },

                    // Communication
                    { symbol: "DIS", name: "Walt Disney Co.", exchange: "NYSE" },
                    { symbol: "CMCSA", name: "Comcast Corporation", exchange: "NASDAQ" },
                    { symbol: "T", name: "AT&T Inc.", exchange: "NYSE" },
                    { symbol: "VZ", name: "Verizon Communications Inc.", exchange: "NYSE" },
                ];

                results = popularStocks.filter(stock =>
                    stock.symbol.toLowerCase().includes(value.toLowerCase()) ||
                    stock.name.toLowerCase().includes(value.toLowerCase())
                );
            }

            setSuggestions(results.slice(0, 10));
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
        router.push(`/analysis?symbol=${suggestionSymbol}`);
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

                        {showSuggestions && suggestions.length > 0 && selectedCountry === "USA" && (
                            <div className="absolute z-10 w-full mt-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                                {suggestions.map((suggestion) => (
                                    <button
                                        key={suggestion.symbol}
                                        type="button"
                                        onClick={() => handleSuggestionClick(suggestion.symbol)}
                                        className="w-full px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 border-b border-neutral-100 dark:border-neutral-700 last:border-b-0 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-semibold text-neutral-900 dark:text-white">
                                                    {suggestion.symbol}
                                                </div>
                                                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                                    {suggestion.name}
                                                </div>
                                            </div>
                                            <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                                {suggestion.exchange}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={selectedCountry !== "USA"}
                        >
                            <TrendingUp className="w-5 h-5 mr-2 inline" />
                            Analyze Stock
                        </Button>
                    </form>
                </div>

                {selectedCountry !== "USA" && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            <strong>Coming Soon:</strong> {countries.find(c => c.code === selectedCountry)?.name} market support is in progress. Currently only USA stocks are available.
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
}
