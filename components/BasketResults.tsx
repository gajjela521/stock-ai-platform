"use client";

import { BasketCalculation } from "@/types/basket";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";

interface BasketResultsProps {
    calculation: BasketCalculation;
}

export function BasketResults({ calculation }: BasketResultsProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    const formatPercentage = (value: number) => {
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(2)}%`;
    };

    const getReturnColor = (value: number) => {
        if (value > 0) return 'text-green-600 dark:text-green-400';
        if (value < 0) return 'text-red-600 dark:text-red-400';
        return 'text-neutral-600 dark:text-neutral-400';
    };

    const timePeriodLabel = {
        '1M': '1 Month',
        '6M': '6 Months',
        '1Y': '1 Year'
    }[calculation.timePeriod];

    return (
        <div className="space-y-6">
            {/* Summary Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Portfolio Performance - {timePeriodLabel}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <div className="text-sm text-neutral-600 dark:text-neutral-400">Current Value</div>
                                <div className="text-3xl font-bold text-neutral-900 dark:text-white">
                                    {formatCurrency(calculation.currentValue)}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                    If Invested {timePeriodLabel} Ago
                                </div>
                                <div className="text-2xl font-semibold text-neutral-700 dark:text-neutral-300">
                                    {formatCurrency(calculation.historicalValue)}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="text-sm text-neutral-600 dark:text-neutral-400">Total Return</div>
                                <div className={`text-3xl font-bold ${getReturnColor(calculation.totalReturn)}`}>
                                    {formatCurrency(calculation.totalReturn)}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-neutral-600 dark:text-neutral-400">Return Percentage</div>
                                <div className={`text-2xl font-semibold ${getReturnColor(calculation.returnPercentage)}`}>
                                    {formatPercentage(calculation.returnPercentage)}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Breakdown Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Stock Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                        Stock
                                    </th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                        Shares
                                    </th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                        Current Price
                                    </th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                        Historical Price
                                    </th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                        Current Value
                                    </th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                        Return
                                    </th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                        Return %
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {calculation.breakdown.map((stock, index) => (
                                    <tr
                                        key={stock.symbol}
                                        className={`border-b border-neutral-100 dark:border-neutral-900 ${index % 2 === 0 ? 'bg-neutral-50 dark:bg-neutral-900/50' : ''
                                            }`}
                                    >
                                        <td className="py-3 px-4">
                                            <div className="font-semibold text-neutral-900 dark:text-white">
                                                {stock.symbol}
                                            </div>
                                            <div className="text-xs text-neutral-600 dark:text-neutral-400">
                                                {stock.name}
                                            </div>
                                        </td>
                                        <td className="text-right py-3 px-4 text-neutral-700 dark:text-neutral-300">
                                            {stock.shares}
                                        </td>
                                        <td className="text-right py-3 px-4 text-neutral-700 dark:text-neutral-300">
                                            {formatCurrency(stock.currentPrice)}
                                        </td>
                                        <td className="text-right py-3 px-4 text-neutral-700 dark:text-neutral-300">
                                            {formatCurrency(stock.historicalPrice)}
                                        </td>
                                        <td className="text-right py-3 px-4 font-semibold text-neutral-900 dark:text-white">
                                            {formatCurrency(stock.currentValue)}
                                        </td>
                                        <td className={`text-right py-3 px-4 font-semibold ${getReturnColor(stock.return)}`}>
                                            {formatCurrency(stock.return)}
                                        </td>
                                        <td className={`text-right py-3 px-4 font-semibold ${getReturnColor(stock.returnPercentage)}`}>
                                            {formatPercentage(stock.returnPercentage)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Info Note */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Note:</strong> Historical prices are based on actual market data from {timePeriodLabel} ago.
                    Returns are calculated using closing prices and do not include dividends or trading fees.
                </p>
            </div>
        </div>
    );
}
