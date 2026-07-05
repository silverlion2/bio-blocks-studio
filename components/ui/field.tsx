import * as React from "react";
import { cn } from "@/lib/utils";

export function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("grid gap-1.5 text-sm font-medium text-[#333]", className)}>
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-10 w-full rounded-xl border border-[#EAEAEA] bg-white px-3 text-sm outline-none transition focus:border-[#1677FF] focus:ring-4 focus:ring-[#1677FF]/10",
        props.className
      )}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-24 w-full rounded-xl border border-[#EAEAEA] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#1677FF] focus:ring-4 focus:ring-[#1677FF]/10",
        props.className
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-10 w-full rounded-xl border border-[#EAEAEA] bg-white px-3 text-sm outline-none transition focus:border-[#1677FF] focus:ring-4 focus:ring-[#1677FF]/10",
        props.className
      )}
    />
  );
}

export function Checkbox(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="checkbox" {...props} className={cn("h-4 w-4 accent-[#1677FF]", props.className)} />;
}
