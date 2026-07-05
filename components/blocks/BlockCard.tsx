"use client";

import { Download, ExternalLink, ImageIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Block } from "@/types/block";
import { cn } from "@/lib/utils";
import { getPublicBlockSizeClass } from "@/constants/block-layout";
import { ImageBlock } from "@/components/blocks/ImageBlock";
import { LinkBlock } from "@/components/blocks/LinkBlock";
import { ProjectBlock } from "@/components/blocks/ProjectBlock";
import { SocialBlock } from "@/components/blocks/SocialBlock";
import { StatusBlock } from "@/components/blocks/StatusBlock";
import { TextBlock } from "@/components/blocks/TextBlock";
import { VideoBlock } from "@/components/blocks/VideoBlock";

export function BlockCard({
  block,
  compact = false,
  disableActions = false,
  disableHoverReveal = false,
  withLayout = true,
  className
}: {
  block: Block;
  compact?: boolean;
  disableActions?: boolean;
  disableHoverReveal?: boolean;
  withLayout?: boolean;
  className?: string;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

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
          color: block.textColor || "var(--site-text)"
        }}
        className={cn(
          "group relative overflow-hidden rounded-[20px] border border-[var(--site-border)] p-4 shadow-soft transition",
          "focus:outline-none focus:ring-4 focus:ring-[#1677FF]/10",
          clickable && "cursor-pointer hover:-translate-y-0.5 hover:border-[#1677FF]/30",
          withLayout && !compact && getPublicBlockSizeClass(block),
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
              !disableHoverReveal && "group-hover:opacity-0"
            )}
          />
        ) : null}
        {hasCover ? (
          <div
            className={cn(
              "pointer-events-none absolute inset-x-4 bottom-4 z-20 flex items-end justify-between gap-3 transition duration-200",
              !disableHoverReveal && "group-hover:opacity-0"
            )}
          >
            <span className="line-clamp-2 max-w-full rounded-[18px] border border-[#E5E7EB] bg-white/95 px-3 py-1.5 text-sm font-semibold leading-5 text-[#111] shadow-soft">
              {block.title}
            </span>
          </div>
        ) : null}
        <div
          className={cn(
            "relative z-30 flex h-full flex-col justify-between gap-4 transition duration-200",
            hasCover && (disableHoverReveal ? "opacity-0" : "opacity-0 group-hover:opacity-100")
          )}
        >
          <div>{renderBlock(block, hasCover)}</div>
          <div className="flex items-center justify-between gap-3">
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
          </div>
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
            <p className="text-sm font-medium text-[#64748B]">{block.subtitle}</p>
            <h3 className="text-2xl font-semibold">{block.title}</h3>
            <p className="leading-7 text-[#555]">{block.description || "No additional details yet."}</p>
          </div>
        </Dialog>
      ) : null}
    </>
  );
}

function renderBlock(block: Block, hideTitle = false) {
  const displayBlock = hideTitle ? { ...block, title: "" } : block;
  if (block.type === "project") return <ProjectBlock block={displayBlock} />;
  if (block.type === "image") return <ImageBlock block={displayBlock} />;
  if (block.type === "text") return <TextBlock block={displayBlock} />;
  if (block.type === "social") return <SocialBlock block={displayBlock} />;
  if (block.type === "video") return <VideoBlock block={displayBlock} />;
  if (block.type === "status") return <StatusBlock block={displayBlock} />;
  return <LinkBlock block={displayBlock} />;
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
