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

    const formatTime = (timezone: string) => {
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

    const currentTime = {
        northAmerica: formatTime("America/New_York"),
        europe: formatTime("Europe/London"),
        asia: formatTime("Asia/Tokyo"),
    };

    const groupedExchanges = {
        northAmerica: ["NYSE", "NASDAQ", "TSX"],
        europe: ["LSE", "EURONEXT", "XETRA"],
        asia: ["JPX", "HKSE", "SHZ"],
    };

    const marketStatus = data; // Alias data for clarity in new JSX

    return (
        <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-500" />
                    Global Market Status
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Regional Time Clocks */}
                <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="text-center">
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">North America</div>
                        <div className="flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3 text-neutral-400" />
                            <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                {currentTime.northAmerica}
                            </div>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Europe</div>
                        <div className="flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3 text-neutral-400" />
                            <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                {currentTime.europe}
                            </div>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Asia</div>
                        <div className="flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3 text-neutral-400" />
                            <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                {currentTime.asia}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Compact Exchange Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                    {groupedExchanges.northAmerica.map((ex) => {
                        const status = marketStatus.find((m) => m.exchange === ex);
                        const isOpen = status?.status === "open";
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
                    {groupedExchanges.europe.map((ex) => {
                        const status = marketStatus.find((m) => m.exchange === ex);
                        const isOpen = status?.status === "open";
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
                    {groupedExchanges.asia.map((ex) => {
                        const status = marketStatus.find((m) => m.exchange === ex);
                        const isOpen = status?.status === "open";
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
            </CardContent>
        </Card>
    );
}
