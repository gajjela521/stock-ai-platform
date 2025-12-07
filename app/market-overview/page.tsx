"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Treemap } from "@/components/Treemap";
import { fetchSP500MarketData, calculateTreemapLayout, TreemapRect } from "@/lib/marketOverview";

export default function MarketOverviewPage() {
    const router = useRouter();
    const [rects, setRects] = useState<TreemapRect[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const loadData = async () => {
        setLoading(true);
        setError(null);

        try {
            const stocks = await fetchSP500MarketData();

            if (stocks.length === 0) {
                setError("No data available. Using mock data.");
            }

            // Calculate layout based on container size
            const width = containerRef.current?.clientWidth || window.innerWidth;
            const height = containerRef.current?.clientHeight || window.innerHeight - 80;

            const layout = calculateTreemapLayout(stocks, width, height);
            setRects(layout);
        } catch (err) {
            console.error("Error loading market data:", err);
            setError("Failed to load market data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();

        // Recalculate layout on window resize
        const handleResize = () => {
            if (rects.length > 0 && containerRef.current) {
                const width = containerRef.current.clientWidth;
                const height = containerRef.current.clientHeight;
                const stocks = rects.map(r => r.stock);
                const layout = calculateTreemapLayout(stocks, width, height);
                setRects(layout);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="relative h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
            {/* Header */}
            <div className="flex-none bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4 flex items-center justify-between z-10">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                        USA Market Overview
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        S&P 500 stocks sized by market cap, colored by daily performance
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadData}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={() => router.push("/")}
                        className="flex items-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Home
                    </Button>
                </div>
            </div>

            {/* Treemap Container */}
            <div
                ref={containerRef}
                className="flex-1 relative overflow-hidden"
            >
                {loading && (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <RefreshCw className="w-12 h-12 animate-spin text-neutral-400 mx-auto mb-4" />
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Loading S&P 500 market data...
                            </p>
                        </div>
                    </div>
                )}

                {error && !loading && (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center max-w-md">
                            <p className="text-neutral-600 dark:text-neutral-400 mb-4">{error}</p>
                            <Button onClick={loadData}>Try Again</Button>
                        </div>
                    </div>
                )}

                {!loading && !error && rects.length > 0 && <Treemap rects={rects} />}
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-3 shadow-lg">
                <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                    Daily Performance
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgb(153, 27, 27)" }}></div>
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">-5%+</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgb(239, 68, 68)" }}></div>
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">-2%</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgb(156, 163, 175)" }}></div>
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">0%</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgb(34, 197, 94)" }}></div>
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">+2%</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgb(0, 128, 0)" }}></div>
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">+5%+</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
