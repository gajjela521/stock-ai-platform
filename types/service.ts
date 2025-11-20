export interface APIEndpointStatus {
    name: string;
    endpoint: string;
    status: "active" | "inactive" | "degraded" | "checking";
    responseTime?: number;
    lastChecked?: Date;
    error?: string;
    details?: string;
}

export interface ServiceHealth {
    overall: "healthy" | "degraded" | "down";
    endpoints: APIEndpointStatus[];
    apiKeyConfigured: boolean;
    lastUpdated: Date;
}
