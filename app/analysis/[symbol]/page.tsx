"use client";

import { Dashboard } from "@/components/Dashboard";
import { fetchStockAnalysis } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { FullAnalysis } from "@/types";

interface PageProps {
    params: {
        symbol: string;
    };
}

export default function AnalysisPage({ params }: PageProps) {
    const [data, setData] = useState<FullAnalysis | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            // In a real static export, params might be unavailable at build time for all paths.
            // However, for client-side navigation in a SPA on GH Pages, this works.
            // We use the mock API which is client-safe.
            const result = await fetchStockAnalysis(params.symbol);
            setData(result);
            setLoading(false);
        };
        loadData();
    }, [params.symbol]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50 dark:bg-neutral-950">
                <div className="animate-pulse text-lg font-medium text-neutral-500">Analyzing Market Data...</div>
            </div>
        );
    }

    if (!data) {
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
