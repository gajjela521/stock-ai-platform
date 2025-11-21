"use client";

import { StockMover } from "@/types/market";

interface StockDataGridProps {
    stocks: StockMover[];
    title: string;
    type: 'gainers' | 'losers';
}

export function StockDataGrid({ stocks, title, type }: StockDataGridProps) {
    const getChangeColor = (changePercentage: string) => {
        const value = parseFloat(changePercentage.replace('%', ''));
        if (type === 'gainers') {
            return 'text-green-600 dark:text-green-400';
        } else {
            return 'text-red-600 dark:text-red-400';
        }
    };

    const formatPrice = (price: string) => {
        return `$${parseFloat(price).toFixed(2)}`;
    };

    if (stocks.length === 0) {
        return (
            <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                <p className="text-sm">No data available</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 px-3">
                {title}
            </h3>
            <div className="space-y-1">
                {stocks.map((stock, index) => (
                    <div
                        key={stock.ticker}
                        className="px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-neutral-500 dark:text-neutral-400 w-4">
                                    {index + 1}
                                </span>
                                <span className="font-semibold text-sm text-neutral-900 dark:text-white">
                                    {stock.ticker}
                                </span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    {formatPrice(stock.price)}
                                </div>
                                <div className={`text-xs font-semibold ${getChangeColor(stock.change_percentage)}`}>
                                    {stock.change_percentage}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
