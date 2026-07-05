import type { Block } from "@/types/block";
import type { Section } from "@/types/section";
import { cn } from "@/lib/utils";
import { BlockGrid } from "@/components/site/BlockGrid";

const titleSize = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl"
};

const align = {
  left: "text-left",
  center: "text-center",
  right: "text-right"
};

export function SectionGroup({ section, blocks }: { section: Section; blocks: Block[] }) {
  const hasHeading = Boolean(section.title.trim() || section.emoji || section.description);
  if (!hasHeading && blocks.length === 0) return null;

  return (
    <section className="grid gap-4">
      {hasHeading ? (
        <div className={cn("grid gap-1 px-1", align[section.titleAlign])}>
          <h2 className={cn("font-bold tracking-normal", titleSize[section.titleSize])}>
            {section.title.trim()}
            {section.emoji ? <span className="ml-1 text-[#1479FF]">{section.emoji}</span> : null}
          </h2>
          {section.description ? <p className="text-sm leading-6 text-[#64748B]">{section.description}</p> : null}
        </div>
      ) : null}
      {blocks.length > 0 ? <BlockGrid blocks={blocks} layout={section.layout} gap={section.gap} /> : null}
    </section>
  );
}
