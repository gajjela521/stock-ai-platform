import { StockSearch } from "@/components/StockSearch";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-neutral-900 dark:text-white mb-4">
            AI Stock Analysis
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Advanced market intelligence powered by real-time data and AI-driven insights.
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            <StockSearch />
          </div>

          {/* Market Overview Link */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Link href="/market-overview">
              <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg px-6 py-4 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      USA Market Overview
                    </h3>
                    <p className="text-sm text-blue-100 mt-1">
                      View S&P 500 stocks in an interactive treemap
                    </p>
                  </div>
                  <svg
                    className="w-6 h-6 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="mt-16 text-center animate-in fade-in duration-700 delay-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-6">
              <div className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Real-Time</div>
              <p className="text-neutral-600 dark:text-neutral-400">Live market data and quotes</p>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">AI-Powered</div>
              <p className="text-neutral-600 dark:text-neutral-400">Intelligent predictions and analysis</p>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Comprehensive</div>
              <p className="text-neutral-600 dark:text-neutral-400">Complete financial insights</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
