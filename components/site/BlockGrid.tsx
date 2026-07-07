import type { CSSProperties } from "react";
import type { Block } from "@/types/block";
import type { PublicDesktopContentColumns } from "@/lib/public-content-layout";
import type { SectionGap, SectionLayout } from "@/types/section";
import { cn } from "@/lib/utils";
import { blockGridClass } from "@/constants/block-layout";
import { getPublicBlockPlacementStyle, getPublicCompactedBlockGridStyles } from "@/lib/public-content-layout";
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

export function BlockGrid({
  blocks,
  layout,
  gap,
  desktopContentColumns = 3,
  hidePlaceholderContent = false
}: {
  blocks: Block[];
  layout: SectionLayout;
  gap: SectionGap;
  desktopContentColumns?: PublicDesktopContentColumns;
  hidePlaceholderContent?: boolean;
}) {
  if (blocks.length === 0) {
    return null;
  }

  const mobileStyles = getPublicCompactedBlockGridStyles(blocks, "mobile", desktopContentColumns);
  const desktopStyles = getPublicCompactedBlockGridStyles(blocks, "desktop", desktopContentColumns);

  return (
    <div
      className={cn(layout === "grid" ? blockGridClass : "grid grid-cols-1", gapClasses[gap])}
      style={{ "--block-grid-gap": gapSizes[gap] } as CSSProperties & { "--block-grid-gap": string }}
    >
      {blocks.map((block) => (
        <BlockCard
          key={block.id}
          block={block}
          hidePlaceholderContent={hidePlaceholderContent}
          layoutStyle={getPublicBlockPlacementStyle(
            block,
            desktopContentColumns,
            {
              mobile: mobileStyles.get(block.id),
              desktop: desktopStyles.get(block.id)
            }
          )}
        />
      ))}
    </div>
  );
}
