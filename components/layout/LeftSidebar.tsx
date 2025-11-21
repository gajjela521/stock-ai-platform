import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, Activity, ShoppingBasket, X } from "lucide-react";

const mainNavItems = [
    {
        name: "Market Overview",
        href: "/market-overview",
        icon: TrendingUp,
        description: "S&P 500 Treemap"
    },
    {
        name: "Build Your Basket",
        href: "/basket",
        icon: ShoppingBasket,
        description: "Portfolio Calculator"
    }
];

const serviceStatusItem = {
    name: "Service Status",
    href: "/service-status",
    icon: Activity,
    description: "API Health & Test Mode"
};

interface LeftSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function LeftSidebar({ isOpen = false, onClose }: LeftSidebarProps) {
    const pathname = usePathname();

    const renderNavItem = (item: typeof mainNavItems[0], isActive: boolean) => {
        const Icon = item.icon;
        return (
            <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
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
    };

    return (
        <aside
            className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-neutral-900 dark:bg-neutral-950 border-r border-neutral-800 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
        >
            {/* Mobile Header */}
            <div className="md:hidden p-4 border-b border-neutral-800 flex items-center justify-between">
                <div className="font-semibold text-white">Menu</div>
                <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {mainNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    return renderNavItem(item, isActive);
                })}
            </nav>

            {/* Service Status - Separated at Bottom */}
            <div className="border-t border-neutral-800">
                <div className="p-4 space-y-2">
                    <div className="text-xs text-neutral-500 uppercase tracking-wider mb-2">
                        System
                    </div>
                    {renderNavItem(serviceStatusItem, pathname === serviceStatusItem.href)}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-800">
                <div className="text-xs text-neutral-500 text-center">
                    © 2025 AI Stock Analysis
                </div>
            </div>
        </aside>
    );
}
