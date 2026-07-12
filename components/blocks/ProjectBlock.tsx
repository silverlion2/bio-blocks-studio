import type { Block } from "@/types/block";
import { BlockIcon, getBlockIconColor } from "@/components/blocks/BlockIcon";

export function ProjectBlock({ block }: { block: Block }) {
  const iconColor = getBlockIconColor(block.metadata?.iconColor);
  return (
    <div className="grid gap-2">
      {block.icon ? <div className="flex"><BlockIcon name={block.icon} className="h-6 w-6" style={{ color: iconColor }} /></div> : null}
      {block.title ? <h3 className="text-xl font-semibold leading-tight">{block.title}</h3> : null}
      {block.subtitle ? <p className="text-sm font-medium text-[#475569]">{block.subtitle}</p> : null}
      {block.description ? <p className="line-clamp-4 text-sm leading-6 text-[#555]">{block.description}</p> : null}
    </div>
  );
}
