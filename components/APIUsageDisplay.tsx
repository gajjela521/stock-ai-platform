"use client";

import { useEffect, useState } from "react";
import { getUsageStats } from "@/lib/apiUsageTracker";
import { Card } from "./ui/Card";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

export function APIUsageDisplay() {
    const [stats, setStats] = useState({
        dailyUsed: 0,
        dailyLimit: 25,
        dailyRemaining: 25,
        minuteUsed: 0,
        minuteLimit: 5,
        minuteRemaining: 5,
        resetIn: 0,
    });

    useEffect(() => {
        const updateStats = () => {
            setStats(getUsageStats());
        };

        updateStats();
        const interval = setInterval(updateStats, 1000);
        return () => clearInterval(interval);
    }, []);

    const dailyPercentage = (stats.dailyUsed / stats.dailyLimit) * 100;
    const minutePercentage = (stats.minuteUsed / stats.minuteLimit) * 100;

    const getDailyColor = () => {
        if (dailyPercentage >= 90) return "text-red-600 dark:text-red-400";
        if (dailyPercentage >= 70) return "text-yellow-600 dark:text-yellow-400";
        return "text-green-600 dark:text-green-400";
    };

    const getMinuteColor = () => {
        if (minutePercentage >= 80) return "text-red-600 dark:text-red-400";
        if (minutePercentage >= 60) return "text-yellow-600 dark:text-yellow-400";
        return "text-green-600 dark:text-green-400";
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) return `${hours}h ${minutes}m`;
        if (minutes > 0) return `${minutes}m ${secs}s`;
        return `${secs}s`;
    };

    return (
        <Card className="p-4">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                        Alpha Vantage API Usage
                    </h3>
                    {stats.dailyRemaining > 0 ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                </div>

                {/* Daily Usage */}
                <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-neutral-600 dark:text-neutral-400">Daily Limit</span>
                        <span className={`font-semibold ${getDailyColor()}`}>
                            {stats.dailyUsed} / {stats.dailyLimit}
                        </span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${dailyPercentage >= 90
                                    ? "bg-red-500"
                                    : dailyPercentage >= 70
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                                }`}
                            style={{ width: `${Math.min(dailyPercentage, 100)}%` }}
                        />
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                        <span className="text-neutral-500 dark:text-neutral-400">
                            {stats.dailyRemaining} remaining
                        </span>
                        <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Resets in {formatTime(stats.resetIn)}
                        </span>
                    </div>
                </div>

                {/* Per-Minute Usage */}
                <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-neutral-600 dark:text-neutral-400">Per Minute</span>
                        <span className={`font-semibold ${getMinuteColor()}`}>
                            {stats.minuteUsed} / {stats.minuteLimit}
                        </span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${minutePercentage >= 80
                                    ? "bg-red-500"
                                    : minutePercentage >= 60
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                                }`}
                            style={{ width: `${Math.min(minutePercentage, 100)}%` }}
                        />
                    </div>
                    <div className="text-xs mt-1 text-neutral-500 dark:text-neutral-400">
                        {stats.minuteRemaining} remaining this minute
                    </div>
                </div>

                {stats.dailyRemaining === 0 && (
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-800 dark:text-red-200">
                        <strong>Daily limit reached!</strong> Please wait {formatTime(stats.resetIn)} for reset.
                    </div>
                )}

                {stats.minuteRemaining === 0 && stats.dailyRemaining > 0 && (
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-800 dark:text-yellow-200">
                        <strong>Rate limit!</strong> Wait 60 seconds before next request.
                    </div>
                )}
            </div>
        </Card>
    );
}
