import type { CSSProperties } from "react";
import type { Block } from "@/types/block";
import type { SectionGap, SectionLayout } from "@/types/section";
import { cn } from "@/lib/utils";
import { blockGridClass } from "@/constants/block-layout";
import { BlockCard } from "@/components/blocks/BlockCard";

const gapClasses: Record<SectionGap, string> = {
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6"
};

const gapSizes: Record<SectionGap, string> = {
  sm: "0.75rem",
  md: "1rem",
  lg: "1.5rem"
};

export function BlockGrid({ blocks, layout, gap }: { blocks: Block[]; layout: SectionLayout; gap: SectionGap }) {
  if (blocks.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(layout === "grid" ? blockGridClass : "grid grid-cols-1", gapClasses[gap])}
      style={{ "--block-grid-gap": gapSizes[gap] } as CSSProperties & { "--block-grid-gap": string }}
    >
      {blocks.map((block) => (
        <BlockCard key={block.id} block={block} />
      ))}
    </div>
  );
}
