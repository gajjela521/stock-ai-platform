"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, Activity, ShoppingBasket } from "lucide-react";

const navItems = [
    {
        name: "Market Overview",
        href: "/market-overview",
        icon: TrendingUp,
        description: "S&P 500 Treemap"
    },
    {
        name: "Service Status",
        href: "/service-status",
        icon: Activity,
        description: "API Health"
    },
    {
        name: "Build Your Basket",
        href: "/basket",
        icon: ShoppingBasket,
        description: "Portfolio Calculator"
    }
];

export function LeftSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-neutral-900 dark:bg-neutral-950 border-r border-neutral-800 flex flex-col">
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                                    : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                                }`}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">
                                    {item.name}
                                </div>
                                <div className={`text-xs truncate ${isActive ? 'text-blue-100' : 'text-neutral-500'
                                    }`}>
                                    {item.description}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-neutral-800">
                <div className="text-xs text-neutral-500 text-center">
                    © 2025 AI Stock Analysis
                </div>
            </div>
        </aside>
    );
}
