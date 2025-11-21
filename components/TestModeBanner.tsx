"use client";

import { useTestMode } from "@/contexts/TestModeContext";
import { AlertTriangle } from "lucide-react";

export function TestModeBanner() {
    const { isTestMode } = useTestMode();

    if (!isTestMode) return null;

    return (
        <div className="fixed top-16 left-0 right-0 z-50 bg-red-100 dark:bg-red-900/30 border-b-2 border-red-300 dark:border-red-800 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-2">
                <div className="flex items-center justify-center gap-2 text-red-700 dark:text-red-300">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                        TEST ENVIRONMENT ENABLED - Using Mock Data
                    </span>
                    <AlertTriangle className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
}
