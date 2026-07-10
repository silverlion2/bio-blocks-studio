"use client";

import { useEffect, useRef, useState } from "react";
import { Languages } from "lucide-react";
import type { SiteLanguage } from "@/types/site-config";
import { cn } from "@/lib/utils";

type PublicLanguageSwitcherProps = {
  currentLocale: string;
  languages: SiteLanguage[];
  accessCode: string;
  className?: string;
  buttonClassName?: string;
};

export function PublicLanguageSwitcher({ currentLocale, languages, accessCode, className, buttonClassName }: PublicLanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
  const visibleLanguages = languages.filter((language) => language.isEnabled).sort((a, b) => a.sortOrder - b.sortOrder);
  const currentLanguage = visibleLanguages.find((language) => language.code === currentLocale) ?? visibleLanguages[0];

  useEffect(() => {
    if (!isOpen) return;

    function closeOnOutsidePointer(event: PointerEvent) {
      if (event.target instanceof Node && !switcherRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    window.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => window.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [isOpen]);

  if (visibleLanguages.length <= 1 || !currentLanguage) return null;

  function selectLanguage(locale: string) {
    if (locale === currentLanguage.code || isPreparing) {
      setIsOpen(false);
      return;
    }

    setIsPreparing(true);
    setIsOpen(false);
    const encodedLocale = encodeURIComponent(locale);
    const languagePath = accessCode
      ? `/${encodeURIComponent(accessCode)}/${encodedLocale}`
      : `/${encodedLocale}`;
    window.setTimeout(() => window.location.assign(languagePath), 180);
  }

  return (
    <div ref={switcherRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label="选择语言"
        title="选择语言"
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--site-border)] bg-white/90 text-[var(--site-text)] shadow-soft transition hover:border-[var(--site-primary)] hover:text-[var(--site-primary)]",
          buttonClassName
        )}
      >
        <Languages className="h-[18px] w-[18px]" />
      </button>

      <div
        className={cn(
          "absolute left-0 top-full mt-2 w-[220px] origin-top-left rounded-[18px] border border-[#E5EAF2] bg-white/96 p-2 text-[#111827] shadow-[0_18px_54px_rgba(15,23,42,0.18)] backdrop-blur transition duration-200",
          isOpen ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-2 scale-95 opacity-0"
        )}
      >
        <div className="grid gap-1.5">
          {visibleLanguages.map((language) => {
            const isActive = language.code === currentLanguage.code;
            return (
              <button
                key={language.code}
                type="button"
                onClick={() => selectLanguage(language.code)}
                disabled={isPreparing}
                className={cn(
                  "flex items-center justify-between rounded-2xl border px-3 py-2 text-left text-sm font-medium transition",
                  isActive
                    ? "border-[#B7D8FF] bg-[#EFF6FF] text-[#1D4ED8]"
                    : "border-transparent bg-white text-[#334155] hover:border-[#BFDBFE] hover:bg-[#F8FBFF]"
                )}
              >
                <span>{language.label}</span>
                <span className={cn("text-xs", isActive ? "text-[#2563EB]" : "text-[#94A3B8]")}>{language.code}</span>
              </button>
            );
          })}
        </div>
      </div>

      {isPreparing ? (
        <div
          className="fixed inset-0 z-[100] flex animate-in flex-col items-center justify-center bg-white/95 text-[#111827] fade-in duration-300 backdrop-blur-[2px]"
          role="status"
          aria-live="polite"
          aria-label="正在准备中"
        >
          <span className="h-7 w-7 animate-spin rounded-full border-2 border-[#D1D5DB] border-t-[#111827]" aria-hidden="true" />
          <span className="mt-4 text-[13px] font-medium tracking-[0.08em] text-[#6B7280]">正在准备中</span>
        </div>
      ) : null}
    </div>
  );
}
