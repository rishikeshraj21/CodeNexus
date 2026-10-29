import { cn } from "../../lib/utils";

function Card({ className, ...props }) {
    return (
        <section
            className={cn(
                "rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-sm",
                className
            )}
            data-slot="card"
            {...props}
        />
    );
}

function CardContent({ className, ...props }) {
    return (
        <div
            className={cn("p-6", className)}
            data-slot="card-content"
            {...props}
        />
    );
}

export { Card, CardContent };
