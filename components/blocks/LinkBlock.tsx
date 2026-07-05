import { LinkIcon } from "lucide-react";
import type { Block } from "@/types/block";

export function LinkBlock({ block }: { block: Block }) {
  return (
    <div className="grid gap-2">
      <LinkIcon className="h-5 w-5 text-[#1677FF]" />
      <div>
        {block.title ? <h3 className="text-lg font-semibold leading-tight">{block.title}</h3> : null}
        {block.subtitle ? <p className="mt-1 text-sm text-[#64748B]">{block.subtitle}</p> : null}
      </div>
      {block.description ? <p className="line-clamp-3 text-sm leading-6 text-[#555]">{block.description}</p> : null}
    </div>
  );
}
