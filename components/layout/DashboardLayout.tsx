"use client";

import { ReactNode } from "react";
import { TopHeader } from "./TopHeader";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { TestModeProvider } from "@/contexts/TestModeContext";
import { TestModeBanner } from "@/components/TestModeBanner";

interface DashboardLayoutProps {
    children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <TestModeProvider>
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col">
                {/* Top Header */}
                <TopHeader />

                {/* Test Mode Banner */}
                <TestModeBanner />

                {/* Main Layout */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Sidebar */}
                    <LeftSidebar />

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>

                    {/* Right Sidebar */}
                    <RightSidebar />
                </div>
            </div>
        </TestModeProvider>
    );
}
