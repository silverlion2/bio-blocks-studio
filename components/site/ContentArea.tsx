import type { Block } from "@/types/block";
import type { ContentOrderItem } from "@/lib/utils";
import type { PublicDesktopContentColumns } from "@/lib/public-content-layout";
import { BlockGrid } from "@/components/site/BlockGrid";
import { BlockCard } from "@/components/blocks/BlockCard";

export function ContentArea({
  topLevelBlocks = [],
  orderedContentItems,
  desktopContentColumns = 3
}: {
  topLevelBlocks?: Block[];
  orderedContentItems?: ContentOrderItem[];
  desktopContentColumns?: PublicDesktopContentColumns;
}) {
  const contentItems =
    orderedContentItems ??
    (topLevelBlocks.length > 0
      ? [{ id: "top-level-blocks" as const, type: "top-level-blocks" as const, blocks: topLevelBlocks, sortOrder: 0 }]
      : []);

  return (
    <section
      data-desktop-content-columns={desktopContentColumns}
      className="content-grid-container grid min-w-0 gap-6 lg:w-full lg:max-w-[var(--site-content-max-width)] lg:justify-self-center"
    >
      {contentItems.map((item) =>
        item.type === "top-level-blocks" ? (
          item.blocks.length > 0 ? (
            <BlockGrid
              key={item.id}
              blocks={item.blocks}
              layout="grid"
              gap="md"
              desktopContentColumns={desktopContentColumns}
              hidePlaceholderContent
            />
          ) : null
        ) : (
          <BlockCard
            key={item.id}
            block={item.block}
            disableActions
            hidePlaceholderContent
            withLayout={false}
            className="min-h-0"
          />
        )
      )}
    </section>
  );
}
