import { Play } from "lucide-react";
import type { Block } from "@/types/block";

export function VideoBlock({ block }: { block: Block }) {
  return (
    <div className="grid gap-2">
      <Play className="h-6 w-6 text-[#1677FF]" />
      <h3 className="text-lg font-semibold">{block.title}</h3>
      {block.description ? <p className="line-clamp-3 text-sm leading-6 text-[#555]">{block.description}</p> : null}
    </div>
  );
}
