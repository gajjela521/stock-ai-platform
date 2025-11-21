import { BasketBuilder } from "@/components/BasketBuilder";

export default function BasketPage() {
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            <div className="container mx-auto px-4 py-8">
                <BasketBuilder />
            </div>
        </div>
    );
}
