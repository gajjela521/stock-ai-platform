"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

export function StockSearch() {
    const [symbol, setSymbol] = useState("");
    const [country, setCountry] = useState("USA");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (symbol.trim()) {
            router.push(`/analysis?symbol=${symbol.trim().toUpperCase()}&country=${country}`);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto shadow-lg border-neutral-200 dark:border-neutral-800">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-serif">Market Intelligence</CardTitle>
                <CardDescription>
                    Enter a company name or ticker to access AI-powered analysis.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="flex space-x-2">
                        <select
                            className="flex h-10 w-24 items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950 dark:placeholder:text-neutral-400 dark:focus:ring-neutral-300"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                        >
                            <option value="USA">USA</option>
                            <option value="UK">UK</option>
                            <option value="India">India</option>
                            <option value="Canada">Canada</option>
                            <option value="Germany">Germany</option>
                        </select>
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                            <Input
                                className="pl-9"
                                placeholder="Symbol (e.g., AAPL)"
                                value={symbol}
                                onChange={(e) => setSymbol(e.target.value)}
                            />
                        </div>
                    </div>
                    <Button type="submit" className="w-full bg-neutral-900 hover:bg-neutral-800 text-white">
                        Analyze Stock
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
