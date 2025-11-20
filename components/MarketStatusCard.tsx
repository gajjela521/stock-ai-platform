import { MarketStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Globe, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface MarketStatusCardProps {
    data: MarketStatus[];
}

export function MarketStatusCard({ data }: MarketStatusCardProps) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getRegionTime = (timezone: string) => {
        try {
            return new Intl.DateTimeFormat("en-US", {
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
                timeZone: timezone,
                hour12: true,
            }).format(time);
        } catch (e) {
            return "--:--:--";
        }
    };

    // Group by region for cleaner display
    const regions = [
        { name: "North America", exchanges: ["NYSE", "NASDAQ", "TSX"], timezone: "America/New_York" },
        { name: "Europe", exchanges: ["LSE", "EURONEXT", "XETRA"], timezone: "Europe/London" },
        { name: "Asia", exchanges: ["JPX", "HKSE", "SHZ"], timezone: "Asia/Tokyo" },
    ];

    return (
        <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-500" />
                    Global Market Status
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {regions.map((region) => (
                        <div key={region.name} className="space-y-2">
                            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1">
                                <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">{region.name}</h3>
                                <div className="flex items-center gap-1 text-xs text-neutral-500 font-mono">
                                    <Clock className="w-3 h-3" />
                                    {getRegionTime(region.timezone)}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {region.exchanges.map((ex) => {
                                    const status = data.find((d) => d.exchange === ex)?.status || "closed";
                                    const isOpen = status.toLowerCase() === "open";
                                    return (
                                        <div key={ex} className="flex flex-col items-center p-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                                            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">{ex}</span>
                                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-1 ${isOpen
                                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                }`}>
                                                {isOpen ? "OPEN" : "CLOSED"}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
