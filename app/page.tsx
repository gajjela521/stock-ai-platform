import { StockSearch } from "@/components/StockSearch";
import { APIUsageDisplay } from "@/components/APIUsageDisplay";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-neutral-900 dark:text-white mb-4">
            Perpendicular
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Advanced market intelligence powered by real-time data and AI-driven insights.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Search Card */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            <StockSearch />
          </div>

          {/* API Usage Display */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <APIUsageDisplay />
          </div>

          {/* Quick Links Info */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Tip:</strong> Use the sidebar to navigate to Market Overview, Service Status, or Build Your Basket
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
