import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
// shadcn/ui Button, adapted to SkillLoop's visual tokens.
const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 disabled:pointer-events-none disabled:opacity-50", {
  variants: { variant: { default: "bg-primary text-white hover:bg-indigo-500", outline: "border border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800", ghost: "text-zinc-400 hover:text-white hover:bg-zinc-800" }, size: { default: "h-11 px-5", sm: "h-9 px-3", lg: "h-12 px-6" } }, defaultVariants: { variant: "default", size: "default" },
});
function Button({ className, variant, size, asChild = false, ...props }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
export { Button, buttonVariants };
