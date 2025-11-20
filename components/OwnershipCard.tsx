import { Ownership } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Users } from "lucide-react";

interface OwnershipCardProps {
    data: Ownership;
}

export function OwnershipCard({ data }: OwnershipCardProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-neutral-500" />
                    <CardTitle className="text-lg">Ownership Structure</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-neutral-600 dark:text-neutral-400">Institutional</span>
                        <span className="font-medium">{data.institutionalPercentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: `${data.institutionalPercentage}%` }} />
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-neutral-600 dark:text-neutral-400">Retail</span>
                        <span className="font-medium">{data.retailPercentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${data.retailPercentage}%` }} />
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-neutral-600 dark:text-neutral-400">Insider</span>
                        <span className="font-medium">{data.insiderPercentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: `${data.insiderPercentage}%` }} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
