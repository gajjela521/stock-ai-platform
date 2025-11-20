"use client";

import { Dashboard } from "@/components/Dashboard";
import { fetchStockAnalysis } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FullAnalysis } from "@/types";

function AnalysisContent() {
    const searchParams = useSearchParams();
    const symbol = searchParams.get("symbol");
    const [data, setData] = useState<FullAnalysis | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (symbol) {
                const result = await fetchStockAnalysis(symbol);
                setData(result);
            }
            setLoading(false);
        };
        loadData();
    }, [symbol]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50 dark:bg-neutral-950">
                <div className="animate-pulse text-lg font-medium text-neutral-500">Analyzing Market Data...</div>
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
