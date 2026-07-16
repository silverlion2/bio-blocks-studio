"use client";

import { Download, ExternalLink, ImageIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Block } from "@/types/block";
import { cn, isSectionTextBlock } from "@/lib/utils";
import { getPublicBlockPlacementStyle, getPublicBlockSizeClass } from "@/constants/block-layout";
import { ProjectBlock } from "@/components/blocks/ProjectBlock";
import { TextBlock } from "@/components/blocks/TextBlock";

export function BlockCard({
  block,
  compact = false,
  disableActions = false,
  disableHoverReveal = false,
  hidePlaceholderContent = false,
  withLayout = true,
  layoutStyle,
  className
}: {
  block: Block;
  compact?: boolean;
  disableActions?: boolean;
  disableHoverReveal?: boolean;
  hidePlaceholderContent?: boolean;
  withLayout?: boolean;
  layoutStyle?: React.CSSProperties & Record<string, string | number | undefined>;
  className?: string;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const displayBlock = hidePlaceholderContent ? getDisplayBlock(block) : block;

  if (isSectionTextBlock(displayBlock)) {
    return <SectionTextCard block={displayBlock} withLayout={withLayout} compact={compact} layoutStyle={layoutStyle} className={className} />;
  }

  function runAction() {
    if (disableActions) return;
    if (block.actionType === "none") return;
    if (block.actionType === "link" && block.href) {
      window.open(block.href, block.openInNewTab === false ? "_self" : "_blank", "noreferrer");
    }
    if (block.actionType === "image-preview") {
      setPreviewOpen(true);
    }
    if (block.actionType === "modal") {
      setModalOpen(true);
    }
    if (block.actionType === "copy") {
      const copyText =
        typeof block.metadata?.copyText === "string" ? block.metadata.copyText : block.href ?? block.title;
      void navigator.clipboard.writeText(copyText);
      toast.success("Copied");
    }
    if (block.actionType === "download" && block.href) {
      const link = document.createElement("a");
      link.href = block.href;
      link.download = block.title;
      link.click();
    }
  }

  const clickable = !disableActions && block.actionType !== "none";
  const hasCover = Boolean(block.coverImage);
  const isPlainTextCard = block.metadata?.textVariant === "plain";
  const hasHoverContent = Boolean(displayBlock.subtitle?.trim() || displayBlock.description?.trim());
  const shouldRevealCoverContent = hasCover && hasHoverContent && !disableHoverReveal;
  const showFooter = Boolean(block.badge) || block.actionType === "link" || block.actionType === "download" || block.actionType === "image-preview";

  return (
    <>
      <article
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
        onClick={runAction}
        onKeyDown={(event) => {
          if (clickable && (event.key === "Enter" || event.key === " ")) runAction();
        }}
        style={{
          backgroundColor: block.backgroundColor || "var(--site-card)",
          color: block.textColor || "var(--site-text)",
          ...(withLayout && !compact ? layoutStyle ?? getPublicBlockPlacementStyle(block) : {})
        }}
        className={cn(
          "group relative overflow-hidden rounded-[20px] border border-[var(--site-border)] p-4 shadow-soft transition",
          "focus:outline-none focus:ring-4 focus:ring-[var(--site-primary)]/10",
          clickable && "cursor-pointer hover:-translate-y-1 hover:border-[var(--site-primary)]",
          withLayout && !compact && getPublicBlockSizeClass(),
          compact && "min-h-36",
          className
        )}
      >
        {block.coverImage ? (
          <img
            src={block.coverImage}
            alt=""
            className={cn(
              "absolute inset-0 h-full w-full object-cover opacity-100 transition duration-200",
              shouldRevealCoverContent && "group-hover:opacity-0"
            )}
          />
        ) : null}
        {hasCover ? (
          <div
            className={cn(
              "pointer-events-none absolute inset-x-4 bottom-4 z-20 flex items-end justify-between gap-3 transition duration-200",
              shouldRevealCoverContent && "group-hover:opacity-0"
            )}
          >
            <span className="line-clamp-2 max-w-full rounded-[18px] border border-[#E5E7EB] bg-white/95 px-3 py-1.5 text-sm font-semibold leading-5 text-[#111] shadow-soft">
              {block.title}
            </span>
          </div>
        ) : null}
        <div
          className={cn(
            "relative z-30 flex h-full flex-col gap-4 transition duration-200",
            isPlainTextCard ? "justify-center" : "justify-between",
            hasCover && (shouldRevealCoverContent ? "opacity-0 group-hover:opacity-100" : "opacity-0")
          )}
        >
          <div className={cn("min-h-0", isPlainTextCard && "flex flex-1")}>{renderBlock(displayBlock, hasCover)}</div>
          {showFooter ? <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-wrap gap-2">
              {block.badge ? (
                <span className="line-clamp-2 max-w-full rounded-[18px] border border-[#E5E7EB] bg-white/95 px-3 py-1.5 text-xs font-semibold leading-5 text-[#475569] shadow-soft">
                  {block.badge}
                </span>
              ) : (
                <span />
              )}
            </div>
            <div className="shrink-0">
              {block.actionType === "link" ? <ExternalLink className="h-4 w-4 text-[#64748B]" /> : null}
              {block.actionType === "download" ? <Download className="h-4 w-4 text-[#64748B]" /> : null}
              {block.actionType === "image-preview" ? <ImageIcon className="h-4 w-4 text-[#64748B]" /> : null}
            </div>
          </div> : null}
        </div>
      </article>

      {previewOpen ? (
        <Dialog onClose={() => setPreviewOpen(false)}>
          {block.coverImage ? (
            <img src={block.coverImage} alt={block.title} className="max-h-[78vh] w-full rounded-[20px] object-contain" />
          ) : (
            <p>No image configured.</p>
          )}
        </Dialog>
      ) : null}
      {modalOpen ? (
        <Dialog onClose={() => setModalOpen(false)}>
          <div className="grid gap-3">
            <p className="text-sm font-medium text-[#64748B]">{displayBlock.subtitle}</p>
            <h3 className="text-2xl font-semibold">{displayBlock.title}</h3>
            <p className="leading-7 text-[#555]">{displayBlock.description || "No additional details yet."}</p>
          </div>
        </Dialog>
      ) : null}
    </>
  );
}

function getDisplayBlock(block: Block): Block {
  if (!isPlaceholderHandle(block.subtitle)) return block;
  return { ...block, subtitle: "" };
}

function isPlaceholderHandle(value?: string) {
  return value?.trim().replace(/^@/, "").toLowerCase() === "your-handle";
}

function renderBlock(block: Block, hideTitle = false) {
  const displayBlock = hideTitle ? { ...block, title: "" } : block;
  if (block.metadata?.textVariant === "plain") return <TextBlock block={displayBlock} />;
  return <ProjectBlock block={displayBlock} />;
}

const sectionTitleSize = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl"
};

const sectionTextAlign = {
  left: "text-left",
  center: "text-center",
  right: "text-right"
};

function SectionTextCard({
  block,
  compact,
  withLayout,
  layoutStyle,
  className
}: {
  block: Block;
  compact: boolean;
  withLayout: boolean;
  layoutStyle?: React.CSSProperties & Record<string, string | number | undefined>;
  className?: string;
}) {
  const rawTitleSize = block.metadata?.titleSize;
  const rawTitleAlign = block.metadata?.titleAlign;
  const titleSize = rawTitleSize === "sm" || rawTitleSize === "lg" ? rawTitleSize : "md";
  const titleAlign = rawTitleAlign === "center" || rawTitleAlign === "right" ? rawTitleAlign : "left";
  const subtitle = block.subtitle || block.description;

  return (
    <article
      style={withLayout && !compact ? layoutStyle ?? getPublicBlockPlacementStyle(block) : undefined}
      className={cn(
        "relative min-w-0 px-1 py-1",
        sectionTextAlign[titleAlign],
        withLayout && !compact && getPublicBlockSizeClass(),
        className
      )}
    >
      <h2 className={cn("font-bold leading-tight tracking-normal", sectionTitleSize[titleSize])}>
        {block.title.trim()}
        {block.icon ? <span className="ml-1 text-[var(--site-primary)]">{block.icon}</span> : null}
      </h2>
      {subtitle ? <p className="mt-1 text-sm leading-6 text-[var(--site-muted)]">{subtitle}</p> : null}
    </article>
  );
}

function Dialog({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-5" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-2xl overflow-auto rounded-[24px] bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} className="mb-4 rounded-full bg-[#F1F5F9] px-3 py-1 text-sm">
          Close
        </button>
        {children}
      </div>
    </div>
  );
}
