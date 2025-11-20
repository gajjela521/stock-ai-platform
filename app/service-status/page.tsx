"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Home, RefreshCw, Activity, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { checkServiceHealth, getStatusColor, getOverallStatusColor } from "@/lib/serviceHealth";
import { ServiceHealth } from "@/types/service";

export default function ServiceStatusPage() {
    const router = useRouter();
    const [health, setHealth] = useState<ServiceHealth | null>(null);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(false);

    const loadHealth = async () => {
        setLoading(true);
        try {
            const result = await checkServiceHealth();
            setHealth(result);
        } catch (error) {
            console.error("Error checking service health:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHealth();
    }, []);

    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(loadHealth, 30000); // Refresh every 30s
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "active":
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case "degraded":
                return <AlertCircle className="w-5 h-5 text-yellow-600" />;
            case "inactive":
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            {/* Header */}
            <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                            <Activity className="w-6 h-6" />
                            Service Status
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                            Monitor API health and performance
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                            <input
                                type="checkbox"
                                checked={autoRefresh}
                                onChange={(e) => setAutoRefresh(e.target.checked)}
                                className="rounded"
                            />
                            Auto-refresh (30s)
                        </label>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadHealth}
                            disabled={loading}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => router.push("/")}
                            className="flex items-center gap-2"
                        >
                            <Home className="w-4 h-4" />
                            Home
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                {loading && !health ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <RefreshCw className="w-12 h-12 animate-spin text-neutral-400 mx-auto mb-4" />
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Checking service health...
                            </p>
                        </div>
                    </div>
                ) : health ? (
                    <div className="space-y-6">
                        {/* Overall Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Overall Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className={`text-3xl font-bold ${getOverallStatusColor(health.overall)}`}>
                                            {health.overall === "healthy" && "All Systems Operational"}
                                            {health.overall === "degraded" && "Partial Outage"}
                                            {health.overall === "down" && "Service Unavailable"}
                                        </div>
                                        <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                                            Last updated: {health.lastUpdated.toLocaleTimeString()}
                                        </div>
                                    </div>
                                    {!health.apiKeyConfigured && (
                                        <Badge variant="destructive">
                                            API Key Not Configured
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* API Key Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuration</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-neutral-900 dark:text-white">
                                            FMP API Key
                                        </div>
                                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                            NEXT_PUBLIC_FMP_API_KEY
                                        </div>
                                    </div>
                                    <Badge className={health.apiKeyConfigured ? getStatusColor("active") : getStatusColor("inactive")}>
                                        {health.apiKeyConfigured ? "Configured" : "Not Configured"}
                                    </Badge>
                                </div>
                                {!health.apiKeyConfigured && (
                                    <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                            <strong>Action Required:</strong> Add your FMP API key to <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">.env.local</code>
                                        </p>
                                        <code className="text-xs text-yellow-700 dark:text-yellow-300 mt-2 block">
                                            NEXT_PUBLIC_FMP_API_KEY=your_api_key_here
                                        </code>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Endpoint Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>API Endpoints</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {health.endpoints.map((endpoint, index) => (
                                        <div
                                            key={index}
                                            className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3 flex-1">
                                                    {getStatusIcon(endpoint.status)}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-neutral-900 dark:text-white">
                                                            {endpoint.name}
                                                        </div>
                                                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-mono truncate">
                                                            {endpoint.endpoint}
                                                        </div>
                                                        {endpoint.error && (
                                                            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300">
                                                                <strong>Error:</strong> {endpoint.error}
                                                            </div>
                                                        )}
                                                        {endpoint.details && (
                                                            <details className="mt-2">
                                                                <summary className="text-xs text-neutral-500 cursor-pointer hover:text-neutral-700">
                                                                    Show details
                                                                </summary>
                                                                <pre className="mt-2 p-2 bg-neutral-100 dark:bg-neutral-800 rounded text-xs overflow-x-auto">
                                                                    {endpoint.details}
                                                                </pre>
                                                            </details>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2 ml-4">
                                                    <Badge className={getStatusColor(endpoint.status)}>
                                                        {endpoint.status.toUpperCase()}
                                                    </Badge>
                                                    {endpoint.responseTime !== undefined && (
                                                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                                            {endpoint.responseTime}ms
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Statistics */}
                        <div className="grid grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                            {health.endpoints.filter(e => e.status === "active").length}
                                        </div>
                                        <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                            Active
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                                            {health.endpoints.filter(e => e.status === "degraded").length}
                                        </div>
                                        <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                            Degraded
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                                            {health.endpoints.filter(e => e.status === "inactive").length}
                                        </div>
                                        <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                            Inactive
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
