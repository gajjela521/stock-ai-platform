import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { StockMover } from "@/types/market";
import { fetchTopGainers, fetchTopLosers } from "@/lib/marketData";
import { StockDataGrid } from "../StockDataGrid";
import { TrendingUp, TrendingDown, RefreshCw, X } from "lucide-react";

import { useTestMode } from "@/contexts/TestModeContext";

interface RightSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function RightSidebar({ isOpen = false, onClose }: RightSidebarProps) {
    const [gainers, setGainers] = useState<StockMover[]>([]);
    const [losers, setLosers] = useState<StockMover[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const { isTestMode } = useTestMode();
    const pathname = usePathname();

    // Close sidebar when route changes
    useEffect(() => {
        if (isOpen && onClose) {
            onClose();
        }
    }, [pathname, isOpen, onClose]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [gainersData, losersData] = await Promise.all([
                fetchTopGainers(10, isTestMode),
                fetchTopLosers(10, isTestMode)
            ]);
            setGainers(gainersData);
            setLosers(losersData);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Error loading market movers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();

        // Auto-refresh every 60 seconds
        const interval = setInterval(loadData, 60000);

        return () => clearInterval(interval);
    }, [isTestMode]);

    return (
        <aside
            className={`
                fixed inset-y-0 right-0 z-50 w-80 bg-neutral-50 dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 flex flex-col overflow-y-auto transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex-shrink-0
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}
            `}
        >
            <div className="sticky top-0 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-4 z-10">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                        Market Movers
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={loadData}
                            disabled={loading}
                            className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50"
                            title="Refresh data"
                        >
                            <RefreshCw className={`w-4 h-4 text-neutral-600 dark:text-neutral-400 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={onClose}
                            className="md:hidden p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                        </button>
                    </div>
                </div>
                {lastUpdated && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Updated {lastUpdated.toLocaleTimeString()}
                    </p>
                )}
            </div>

            <div className="flex-1 p-4 space-y-6">
                {/* Top Gainers */}
                <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <h3 className="font-semibold text-neutral-900 dark:text-white">
                            Top Gainers
                        </h3>
                    </div>
                    {loading && gainers.length === 0 ? (
                        <div className="text-center py-8">
                            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-neutral-400" />
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                                Loading...
                            </p>
                        </div>
                    ) : (
                        <StockDataGrid stocks={gainers} title="" type="gainers" />
                    )}
                </div>

                {/* Top Losers */}
                <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <h3 className="font-semibold text-neutral-900 dark:text-white">
                            Top Losers
                        </h3>
                    </div>
                    {loading && losers.length === 0 ? (
                        <div className="text-center py-8">
                            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-neutral-400" />
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                                Loading...
                            </p>
                        </div>
                    ) : (
                        <StockDataGrid stocks={losers} title="" type="losers" />
                    )}
                </div>

                {/* Info Note */}
                <div className="text-xs text-neutral-500 dark:text-neutral-400 text-center px-2">
                    Data updates every 60 seconds during market hours
                </div>
            </div>
        </aside>
    );
}
