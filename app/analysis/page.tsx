"use client";

import { Dashboard } from "@/components/Dashboard";
import { fetchStockAnalysis } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FullAnalysis } from "@/types";

import { useTestMode } from "@/contexts/TestModeContext";

function AnalysisContent() {
    const searchParams = useSearchParams();
    const symbol = searchParams.get("symbol");
    const [data, setData] = useState<FullAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isTestMode } = useTestMode();

    useEffect(() => {
        const loadData = async () => {
            if (symbol) {
                try {
                    setLoading(true);
                    const result = await fetchStockAnalysis(symbol, isTestMode);
                    setData(result);
                } catch (err: any) {
                    if (err.message === "RATE_LIMIT_EXCEEDED") {
                        setError("Free limit reached. Please wait a minute before searching again.");
                    } else {
                        setError("Failed to fetch stock data. Please try again.");
                    }
                }
            }
            setLoading(false);
        };
        loadData();
    }, [symbol, isTestMode]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50 dark:bg-neutral-950">
                <div className="animate-pulse text-lg font-medium text-neutral-500">Analyzing Market Data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-neutral-50 dark:bg-neutral-950">
                <div className="bg-white dark:bg-neutral-900 p-8 rounded-xl shadow-lg text-center max-w-md border border-neutral-200 dark:border-neutral-800">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h1 className="text-xl font-bold mb-2 text-neutral-900 dark:text-white">Access Limit Reached</h1>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-6">{error}</p>
                    <Link href="/">
                        <Button>Return Home</Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (!symbol || !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold mb-4">Stock Not Found</h1>
                <Link href="/">
                    <Button>Return Home</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="gap-2 pl-0 hover:pl-2 transition-all">
                            <ChevronLeft className="w-4 h-4" />
                            Back to Search
                        </Button>
                    </Link>
                </div>
                <Dashboard data={data} />
            </div>
        </div>
    );
}

export default function AnalysisPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse">Loading...</div></div>}>
            <AnalysisContent />
        </Suspense>
    );
}
