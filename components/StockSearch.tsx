"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { POPULAR_STOCKS } from "@/lib/stocks";

export function StockSearch() {
    const [symbol, setSymbol] = useState("");
    const [country, setCountry] = useState("USA");
    const [suggestions, setSuggestions] = useState<{ symbol: string, name: string }[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (symbol.trim()) {
            router.push(`/analysis?symbol=${symbol.trim().toUpperCase()}&country=${country}`);
            setShowSuggestions(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSymbol(value);

        if (value.length > 0) {
            const filtered = POPULAR_STOCKS.filter(stock =>
                stock.symbol.toLowerCase().includes(value.toLowerCase()) ||
                stock.name.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 5);
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (selectedSymbol: string) => {
        setSymbol(selectedSymbol);
        setSuggestions([]);
        setShowSuggestions(false);
        router.push(`/analysis?symbol=${selectedSymbol}&country=${country}`);
    };

    return (
        <Card className="w-full max-w-md mx-auto shadow-lg border-neutral-200 dark:border-neutral-800 overflow-visible z-50">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-serif">Market Intelligence</CardTitle>
                <CardDescription>
                    Enter a company name or ticker to access AI-powered analysis.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="flex space-x-2 relative" ref={wrapperRef}>
                        <select
                            className="flex h-10 w-24 items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950 dark:placeholder:text-neutral-400 dark:focus:ring-neutral-300"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                        >
                            <option value="USA">USA</option>
                            <option value="UK">UK</option>
                            <option value="India">India</option>
                            <option value="Canada">Canada</option>
                            <option value="Germany">Germany</option>
                        </select>
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                            <Input
                                className="pl-9"
                                placeholder="Symbol (e.g., AAPL)"
                                value={symbol}
                                onChange={handleInputChange}
                                onFocus={() => symbol.length > 0 && setShowSuggestions(true)}
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md shadow-lg z-50 max-h-60 overflow-auto">
                                    {suggestions.map((suggestion) => (
                                        <div
                                            key={suggestion.symbol}
                                            className="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer flex justify-between items-center"
                                            onClick={() => handleSuggestionClick(suggestion.symbol)}
                                        >
                                            <span className="font-medium">{suggestion.symbol}</span>
                                            <span className="text-sm text-neutral-500 truncate ml-2">{suggestion.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <Button type="submit" className="w-full bg-neutral-900 hover:bg-neutral-800 text-white">
                        Analyze Stock
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
