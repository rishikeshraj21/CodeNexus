import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700",
                outline:
                    "border border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700",
                ghost:
                    "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
            },
            size: {
                default: "h-11 px-5",
                sm: "h-9 rounded-md px-3",
                lg: "h-12 rounded-xl px-6 text-base",
                icon: "size-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

function Button({
    className,
    variant,
    size,
    type = "button",
    ...props
}) {
    return (
        <button
            className={cn(buttonVariants({ variant, size }), className)}
            data-slot="button"
            type={type}
            {...props}
        />
    );
}

export { Button };
