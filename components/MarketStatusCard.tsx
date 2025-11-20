import { MarketStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Globe } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface MarketStatusCardProps {
    data: MarketStatus[];
}

export function MarketStatusCard({ data }: MarketStatusCardProps) {
    const regions = {
        "North America": ["NASDAQ", "NYSE", "AMEX", "TSX", "TSXV"],
        "Europe": ["LSE", "XETRA", "EURONEXT", "BRU", "AMS"],
        "Asia": ["BSE", "JPX", "HKSE", "SHZ", "ASX"],
    };

    return (
        <Card className="h-fit">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-neutral-500" />
                    <CardTitle className="text-lg">Global Market Status</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {Object.entries(regions).map(([region, exchanges]) => (
                        <div key={region} className="space-y-2">
                            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{region}</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {exchanges.map((exch) => {
                                    const status = data.find(d => d.exchange === exch)?.status || "closed";
                                    const isOpen = status.toLowerCase() === "open";

                                    return (
                                        <div key={exch} className="flex items-center justify-between p-2 rounded bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                                            <span className="font-medium text-sm">{exch}</span>
                                            <Badge variant={isOpen ? "success" : "secondary"} className="text-[10px] px-1.5 py-0 h-5">
                                                {isOpen ? "Open" : "Closed"}
                                            </Badge>
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
