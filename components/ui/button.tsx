import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "icon";
};

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-10 px-4 text-sm",
        size === "icon" && "h-10 w-10",
        variant === "primary" && "border-transparent bg-[#1677FF] text-white hover:bg-[#0f67df]",
        variant === "secondary" && "border-[#EAEAEA] bg-white text-[#111] hover:bg-[#F8FAFC]",
        variant === "ghost" && "border-transparent bg-transparent text-[#444] hover:bg-[#F1F5F9]",
        variant === "danger" && "border-transparent bg-red-600 text-white hover:bg-red-700",
        className
      )}
      {...props}
    />
  );
}
