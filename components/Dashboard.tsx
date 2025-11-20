"use client";

import { FullAnalysis } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp, TrendingDown, DollarSign, Briefcase, Activity, Target, ThumbsUp, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { OwnershipCard } from "./OwnershipCard";
import { CompetitorList } from "./CompetitorList";
import { MarketStatusCard } from "./MarketStatusCard";

interface DashboardProps {
    data: FullAnalysis;
}

export function Dashboard({ data }: DashboardProps) {
    const { stock, financials, balanceSheet, deals, prediction, ownership, competitors } = data;

    const formatCurrency = (val: number | string) => {
        // If it's already a string (like "N/A"), return it
        if (typeof val === "string") return val;

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
                            <span>•</span>
                            <span className="text-neutral-400">{stock.sector}</span>
                            <span>•</span>
                            <span className="text-neutral-400">{stock.industry}</span>
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
                    <div className="mt-2 flex flex-col items-end gap-1">
                        <Badge variant="outline" className="text-xs font-normal text-neutral-500">
                            {data.financials.length > 0 && data.financials[0].value !== "N/A" ? "Live Data" : "Simulated Data"}
                        </Badge>
                        {stock.lastUpdated && (
                            <span className="text-xs text-neutral-400">
                                As of {new Date(stock.lastUpdated).toLocaleString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true
                                })}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* LIVE MARKET DATA SECTION */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-800">
                    <BarChart3 className="w-5 h-5 text-neutral-500" />
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Live Market Data</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {financials.map((metric, i) => (
                        <Card key={i} className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
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
            </div>

            {/* AI PREDICTION SECTION */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-800">
                    <Activity className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">AI Analysis & Predictions</h2>
                </div>

                {/* AI Prediction */}
                <Card className="border-2 border-indigo-100 dark:border-indigo-900 bg-gradient-to-br from-white to-indigo-50/50 dark:from-neutral-950 dark:to-indigo-950/30 shadow-lg">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Target className="w-5 h-5 text-blue-600" />
                                AI Prediction
                            </CardTitle>
                            <Badge variant="outline" className="text-xs">
                                {(prediction.confidenceScore * 100).toFixed(0)}% Confidence
                            </Badge>
                        </div>
                        <CardDescription className="flex items-center justify-between">
                            <span>Next quarter forecast based on current data</span>
                            {stock.lastUpdated && (
                                <span className="text-xs text-neutral-400">
                                    Generated {new Date(stock.lastUpdated).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit"
                                    })}
                                </span>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-900/50">
                                    <div className="text-sm text-neutral-500 mb-1">Revenue Forecast</div>
                                    <div className="text-2xl font-bold text-neutral-900 dark:text-white">{formatCurrency(prediction.nextQuarterRevenueForecast)}</div>
                                </div>
                                <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-900/50">
                                    <div className="text-sm text-neutral-500 mb-1">EPS Forecast</div>
                                    <div className="text-2xl font-bold text-neutral-900 dark:text-white">${prediction.nextQuarterEPSForecast}</div>
                                </div>
                            </div>

                            <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
                                        <Target className="w-4 h-4" />
                                        Price Target
                                    </div>
                                    <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">${prediction.priceTarget.toFixed(2)}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-neutral-500">Confidence</div>
                                    <div className="text-xl font-bold">{Math.round(prediction.confidenceScore * 100)}%</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
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

                            <div className="bg-green-50/50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-900/50">
                                <div className="flex items-center gap-2 mb-2">
                                    <ThumbsUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    <h4 className="font-semibold text-green-900 dark:text-green-100">Next Quarter Positives</h4>
                                </div>
                                <ul className="space-y-1">
                                    {prediction.nextQuarterPositives.map((positive, i) => (
                                        <li key={i} className="text-sm text-neutral-700 dark:text-neutral-300 pl-6 relative before:content-['•'] before:absolute before:left-2 before:text-green-500">
                                            {positive}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-8">
                    <MarketStatusCard data={data.marketStatus} />
                    <OwnershipCard data={ownership} />
                    <CompetitorList competitors={competitors} />

                    {/* Balance Sheet Summary */}
                    <Card>
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
                                <span className="text-neutral-600 dark:text-neutral-400">Cash & Equivalents</span>
                                <span className="font-medium">{formatCurrency(balanceSheet.cashAndEquivalents)}</span>
                            </div>
                            {balanceSheet.longTermDebt !== undefined && (
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-neutral-600 dark:text-neutral-400">Long-term Debt</span>
                                    <span className="font-medium">{formatCurrency(balanceSheet.longTermDebt)}</span>
                                </div>
                            )}
                            {balanceSheet.totalDebt !== undefined && (
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-neutral-600 dark:text-neutral-400">Total Debt</span>
                                    <span className="font-medium">{formatCurrency(balanceSheet.totalDebt)}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Deals & News */}
                <Card className="md:col-span-2 h-fit">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-neutral-500" />
                            <CardTitle className="text-lg">Recent Deals & Market News</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {deals.length > 0 ? (
                                deals.map((deal) => (
                                    <div key={deal.id} className="flex gap-4 p-4 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors border border-neutral-100 dark:border-neutral-800">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 text-lg">{deal.title}</h4>
                                                <span className="text-xs text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">{deal.date}</span>
                                            </div>
                                            <p className="text-neutral-600 dark:text-neutral-400 mb-3 leading-relaxed">{deal.description}</p>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={deal.sentiment === "positive" ? "success" : deal.sentiment === "negative" ? "destructive" : "secondary"}>
                                                    {deal.sentiment.toUpperCase()}
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
