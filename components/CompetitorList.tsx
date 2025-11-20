import { Competitor } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Users, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompetitorListProps {
    competitors: Competitor[];
}

export function CompetitorList({ competitors }: CompetitorListProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-neutral-500" />
                    <CardTitle className="text-lg">Key Competitors</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {competitors.map((comp) => (
                        <div key={comp.symbol} className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900">
                            <div>
                                <div className="font-semibold">{comp.symbol}</div>
                                <div className="text-xs text-neutral-500">{comp.name}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-medium">${comp.price.toFixed(2)}</div>
                                <div className={cn("flex items-center justify-end text-xs", comp.changePercent >= 0 ? "text-green-600" : "text-red-600")}>
                                    {comp.changePercent >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                                    {comp.changePercent}%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
