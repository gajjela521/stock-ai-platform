import Link from "next/link";
import { Home, Menu, Activity } from "lucide-react";

interface TopHeaderProps {
    onToggleLeftSidebar?: () => void;
    onToggleRightSidebar?: () => void;
}

export function TopHeader({ onToggleLeftSidebar, onToggleRightSidebar }: TopHeaderProps) {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 md:px-6 flex items-center justify-between z-40">
            <div className="flex items-center gap-3">
                {/* Mobile Menu Button */}
                <button
                    onClick={onToggleLeftSidebar}
                    className="lg:hidden p-2 -ml-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                    <Menu className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
                </button>

                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Home className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-serif font-bold text-neutral-900 dark:text-white hidden sm:block">
                            AI Stock Analysis
                        </h1>
                        <h1 className="text-xl font-serif font-bold text-neutral-900 dark:text-white sm:hidden">
                            Stock AI
                        </h1>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 hidden sm:block">
                            Real-time market intelligence
                        </p>
                    </div>
                </Link>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <div className="text-sm text-neutral-600 dark:text-neutral-400 hidden sm:block">
                    {new Date().toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                    })}
                </div>

                {/* Mobile Right Sidebar Toggle */}
                <button
                    onClick={onToggleRightSidebar}
                    className="lg:hidden p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                    <Activity className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
                </button>
            </div>
        </header>
    );
}
