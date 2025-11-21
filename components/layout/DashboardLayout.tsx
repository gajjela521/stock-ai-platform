"use client";

import { ReactNode, useState } from "react";
import { TopHeader } from "./TopHeader";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { TestModeProvider } from "@/contexts/TestModeContext";
import { TestModeBanner } from "@/components/TestModeBanner";

interface DashboardLayoutProps {
    children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

    return (
        <TestModeProvider>
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col pt-16">
                {/* Top Header */}
                <TopHeader
                    onToggleLeftSidebar={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                    onToggleRightSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                />

                {/* Test Mode Banner */}
                <TestModeBanner />

                {/* Main Layout */}
                <div className="flex flex-1 overflow-hidden relative">
                    {/* Mobile Backdrop */}
                    {(isLeftSidebarOpen || isRightSidebarOpen) && (
                        <div
                            className="fixed inset-0 bg-black/50 z-40 md:hidden"
                            onClick={() => {
                                setIsLeftSidebarOpen(false);
                                setIsRightSidebarOpen(false);
                            }}
                        />
                    )}

                    {/* Left Sidebar */}
                    <LeftSidebar
                        isOpen={isLeftSidebarOpen}
                        onClose={() => setIsLeftSidebarOpen(false)}
                    />

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto w-full">
                        {children}
                    </main>

                    {/* Right Sidebar */}
                    <RightSidebar
                        isOpen={isRightSidebarOpen}
                        onClose={() => setIsRightSidebarOpen(false)}
                    />
                </div>
            </div>
        </TestModeProvider>
    );
}
