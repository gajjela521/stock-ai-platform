"use client";

import { useState } from "react";
import { BasketStock, TimePeriod, BasketCalculation, StockCategory } from "@/types/basket";
import { STOCK_CATEGORIES, CATEGORY_ORDER } from "@/lib/basketConstants";
import { calculateBasketReturns } from "@/lib/basketApi";
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Input } from "./ui/Input";
import { BasketResults } from "./BasketResults";

import { useTestMode } from "@/contexts/TestModeContext";

export function BasketBuilder() {
    const [selectedStocks, setSelectedStocks] = useState<Record<string, { symbol: string; name: string }>>({});
    const [shares, setShares] = useState<Record<string, number>>({});
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('1Y');
    const [calculation, setCalculation] = useState<BasketCalculation | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { isTestMode } = useTestMode();

    const handleStockSelect = (category: string, symbol: string, name: string) => {
        setSelectedStocks(prev => ({ ...prev, [category]: { symbol, name } }));
        // Initialize shares to 1 if not set
        if (!shares[category]) {
            setShares(prev => ({ ...prev, [category]: 1 }));
        }
    };

    const handleSharesChange = (category: string, value: string) => {
        const numValue = parseInt(value) || 0;
        setShares(prev => ({ ...prev, [category]: numValue }));
    };

    const handleCalculate = async () => {
        setError(null);
        setCalculation(null);

        // Validation
        if (Object.keys(selectedStocks).length !== 5) {
            setError("Please select one stock from each category");
            return;
        }

        for (const category of CATEGORY_ORDER) {
            if (!selectedStocks[category]) {
                setError(`Please select a stock from ${category}`);
                return;
            }
            if (!shares[category] || shares[category] <= 0) {
                setError(`Please enter a valid number of shares for ${category}`);
                return;
            }
        }

        // Build basket stocks array
        const basketStocks: BasketStock[] = CATEGORY_ORDER.map(category => ({
            category: category as StockCategory,
            symbol: selectedStocks[category].symbol,
            name: selectedStocks[category].name,
            shares: shares[category]
        }));

        setLoading(true);

        try {
            const result = await calculateBasketReturns(basketStocks, timePeriod, isTestMode);
            setCalculation(result);
        } catch (err: any) {
            console.error("Basket calculation error:", err);

            if (err.message?.includes("API_LIMIT_EXCEEDED")) {
                setError("Rate limit reached. Please wait a moment before calculating again.");
            } else if (err.message?.includes("ALPHA_VANTAGE_RATE_LIMIT")) {
                setError("Alpha Vantage API limit reached. Please wait 1 minute or try again tomorrow.");
            } else if (err.message?.includes("VALIDATION_ERROR")) {
                setError(err.message.replace("VALIDATION_ERROR: ", ""));
            } else {
                setError("Failed to calculate basket returns. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">🧺</span>
                        Build Your Basket
                    </CardTitle>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Select one stock from each category and specify the number of shares to calculate historical returns
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Stock Selection */}
                    {CATEGORY_ORDER.map(category => (
                        <div key={category} className="space-y-2">
                            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                {category}
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <select
                                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={selectedStocks[category]?.symbol || ""}
                                    onChange={(e) => {
                                        const stock = STOCK_CATEGORIES[category].find(s => s.symbol === e.target.value);
                                        if (stock) {
                                            handleStockSelect(category, stock.symbol, stock.name);
                                        }
                                    }}
                                >
                                    <option value="">Select a stock...</option>
                                    {STOCK_CATEGORIES[category].map(stock => (
                                        <option key={stock.symbol} value={stock.symbol}>
                                            {stock.symbol} - {stock.name}
                                        </option>
                                    ))}
                                </select>
                                <Input
                                    type="number"
                                    min="1"
                                    placeholder="Number of shares"
                                    value={shares[category] || ""}
                                    onChange={(e) => handleSharesChange(category, e.target.value)}
                                    disabled={!selectedStocks[category]}
                                />
                            </div>
                        </div>
                    ))}

                    {/* Time Period Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                            Time Period (From Date to Today)
                        </label>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                            {([
                                { value: '1M', label: '1 Month' },
                                { value: '3M', label: '3 Months' },
                                { value: '6M', label: '6 Months' },
                                { value: '1Y', label: '1 Year' },
                                { value: '2Y', label: '2 Years' },
                                { value: '3Y', label: '3 Years' },
                                { value: '4Y', label: '4 Years' },
                                { value: '5Y', label: '5 Years' },
                                { value: '10Y', label: '10 Years' }
                            ] as { value: TimePeriod; label: string }[]).map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => setTimePeriod(value)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${timePeriod === value
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Returns calculated from the selected period ago to today's date
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                        </div>
                    )}

                    {/* Calculate Button */}
                    <Button
                        onClick={handleCalculate}
                        disabled={loading || Object.keys(selectedStocks).length !== 5}
                        className="w-full"
                    >
                        {loading ? 'Calculating...' : 'Calculate Returns'}
                    </Button>
                </CardContent>
            </Card>

            {/* Results */}
            {calculation && <BasketResults calculation={calculation} />}
        </div>
    );
}
