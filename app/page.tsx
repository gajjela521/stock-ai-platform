import { StockSearch } from "@/components/StockSearch";
import { TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
      <div className="w-full max-w-4xl space-y-8 text-center">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-neutral-900 dark:bg-white rounded-xl shadow-lg">
              <TrendingUp className="w-8 h-8 text-white dark:text-neutral-900" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-neutral-900 dark:text-white">
            Stock AI Platform
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Advanced market intelligence powered by AI. Get real-time financial data, sentiment analysis, and predictive insights for any global stock.
          </p>
        </div>

        <div className="py-8">
          <StockSearch />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-3xl mx-auto pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">Real-time Data</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Access verified financial metrics, balance sheets, and market data instantly.</p>
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">Deal Intelligence</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Track recent mergers, acquisitions, and strategic partnerships with sentiment analysis.</p>
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">AI Predictions</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Next-quarter forecasting based on complex market signals and historical trends.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
