"use client";

import { FullAnalysis } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp, TrendingDown, DollarSign, Briefcase, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardProps {
    data: FullAnalysis;
}

export function Dashboard({ data }: DashboardProps) {
    const { stock, financials, balanceSheet, deals, prediction } = data;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: stock.currency,
            notation: "compact",
            maximumFractionDigits: 1,
        }).format(val);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    {stock.logoUrl && (
                        <img src={stock.logoUrl} alt={stock.companyName} className="w-16 h-16 object-contain rounded-lg bg-white p-1 shadow-sm" />
                    )}
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white">{stock.companyName}</h1>
                        <div className="flex items-center gap-2 text-neutral-500">
                            <span className="font-semibold">{stock.symbol}</span>
                            <span>•</span>
                            <span>{stock.exchange}</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-bold text-neutral-900 dark:text-white">
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: stock.currency }).format(stock.price)}
                    </div>
                    <div className={cn("flex items-center justify-end gap-1 text-lg font-medium", stock.change >= 0 ? "text-green-600" : "text-red-600")}>
                        {stock.change >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                        {stock.change > 0 ? "+" : ""}{stock.change} ({stock.changePercent}%)
                    </div>
                </div>
            </div>

            {/* AI Prediction Card - Hero Feature */}
            <Card className="border-2 border-indigo-100 dark:border-indigo-900 bg-gradient-to-br from-white to-indigo-50/50 dark:from-neutral-950 dark:to-indigo-950/30 shadow-lg">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            <CardTitle className="text-xl text-indigo-900 dark:text-indigo-100">AI Market Prediction (Next Quarter)</CardTitle>
                        </div>
                        <Badge variant={prediction.marketTrend === "bullish" ? "success" : prediction.marketTrend === "bearish" ? "destructive" : "secondary"}>
                            {prediction.marketTrend.toUpperCase()}
                        </Badge>
                    </div>
                    <CardDescription>Based on sentiment analysis, historical data, and market trends.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-900/50">
                                <div className="text-sm text-neutral-500 mb-1">Forecasted Revenue</div>
                                <div className="text-2xl font-bold text-neutral-900 dark:text-white">{formatCurrency(prediction.nextQuarterRevenueForecast)}</div>
                            </div>
                            <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-900/50">
                                <div className="text-sm text-neutral-500 mb-1">Forecasted EPS</div>
                                <div className="text-2xl font-bold text-neutral-900 dark:text-white">${prediction.nextQuarterEPSForecast}</div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-neutral-700 dark:text-neutral-300">AI Confidence Score</span>
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">{Math.round(prediction.confidenceScore * 100)}%</span>
                            </div>
                            <div className="h-2 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${prediction.confidenceScore * 100}%` }} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/50 dark:bg-neutral-900/50 rounded-lg p-4 border border-indigo-100 dark:border-indigo-900/50">
                        <h4 className="font-semibold mb-2 text-indigo-900 dark:text-indigo-100">Key Reasoning</h4>
                        <ul className="space-y-2">
                            {prediction.reasoning.map((reason, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                                    {reason}
                                </li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Financials Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {financials.map((metric, i) => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <div className="text-sm text-neutral-500 mb-1">{metric.label}</div>
                            <div className="flex items-center gap-2">
                                <div className="text-xl font-bold">{metric.value}</div>
                                {metric.trend === "up" && <TrendingUp className="w-4 h-4 text-green-500" />}
                                {metric.trend === "down" && <TrendingDown className="w-4 h-4 text-red-500" />}
                                {metric.trend === "neutral" && <Minus className="w-4 h-4 text-neutral-400" />}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Balance Sheet Summary */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-neutral-500" />
                            <CardTitle className="text-lg">Balance Sheet</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-neutral-800">
                            <span className="text-neutral-600 dark:text-neutral-400">Total Assets</span>
                            <span className="font-medium">{formatCurrency(balanceSheet.totalAssets)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-neutral-800">
                            <span className="text-neutral-600 dark:text-neutral-400">Total Liabilities</span>
                            <span className="font-medium">{formatCurrency(balanceSheet.totalLiabilities)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-neutral-800">
                            <span className="text-neutral-600 dark:text-neutral-400">Total Equity</span>
                            <span className="font-medium">{formatCurrency(balanceSheet.totalEquity)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-neutral-800">
                            <span className="text-neutral-600 dark:text-neutral-400">Cash & Eq.</span>
                            <span className="font-medium">{formatCurrency(balanceSheet.cashAndEquivalents)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-neutral-600 dark:text-neutral-400">Long Term Debt</span>
                            <span className="font-medium">{formatCurrency(balanceSheet.longTermDebt)}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Deals & News */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-neutral-500" />
                            <CardTitle className="text-lg">Recent Deals & News</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {deals.length > 0 ? (
                                deals.map((deal) => (
                                    <div key={deal.id} className="flex gap-4 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors border border-transparent hover:border-neutral-100 dark:hover:border-neutral-800">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">{deal.title}</h4>
                                                <span className="text-xs text-neutral-500">{deal.date}</span>
                                            </div>
                                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">{deal.description}</p>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={deal.sentiment === "positive" ? "success" : deal.sentiment === "negative" ? "destructive" : "secondary"}>
                                                    {deal.sentiment}
                                                </Badge>
                                                {deal.value && <Badge variant="outline">{deal.value}</Badge>}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-neutral-500">No recent deals found.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
