"use client";

import Link from "next/link";
import { Home } from "lucide-react";

export function TopHeader() {
    return (
        <header className="h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 flex items-center justify-between sticky top-0 z-40">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Home className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-serif font-bold text-neutral-900 dark:text-white">
                        AI Stock Analysis
                    </h1>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        Real-time market intelligence
                    </p>
                </div>
            </Link>

            <div className="flex items-center gap-4">
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    {new Date().toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                    })}
                </div>
            </div>
        </header>
    );
}
