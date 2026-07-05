import type { Block } from "@/types/block";

export function TextBlock({ block }: { block: Block }) {
  return (
    <div className="grid gap-2">
      {block.title ? <h3 className="text-lg font-semibold">{block.title}</h3> : null}
      {block.description ? <p className="line-clamp-5 text-sm leading-6 text-[#555]">{block.description}</p> : null}
    </div>
  );
}
