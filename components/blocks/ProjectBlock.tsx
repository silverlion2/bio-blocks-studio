import { Boxes } from "lucide-react";
import type { Block } from "@/types/block";

export function ProjectBlock({ block }: { block: Block }) {
  return (
    <div className="grid gap-2">
      <Boxes className="h-6 w-6 text-[#1677FF]" />
      {block.title ? <h3 className="text-xl font-semibold leading-tight">{block.title}</h3> : null}
      {block.subtitle ? <p className="text-sm font-medium text-[#475569]">{block.subtitle}</p> : null}
      {block.description ? <p className="line-clamp-4 text-sm leading-6 text-[#555]">{block.description}</p> : null}
    </div>
  );
}
