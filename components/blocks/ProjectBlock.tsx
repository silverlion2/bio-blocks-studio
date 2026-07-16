import type { Block } from "@/types/block";
import { BlockIcon, getBlockIconColor } from "@/components/blocks/BlockIcon";

export function ProjectBlock({ block }: { block: Block }) {
  const iconColor = getBlockIconColor(block.metadata?.iconColor);
  const category = getString(block.metadata?.category);
  const stack = getStringArray(block.metadata?.stack);
  const metrics = getMetrics(block.metadata?.metrics);

  if (block.metadata?.visualVariant === "snapshot") {
    return (
      <div className="grid h-full gap-5 md:grid-cols-[1.25fr_2fr] md:items-center">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--site-primary)]">Builder snapshot</p>
          <h3 className="max-w-md text-xl font-semibold leading-snug">{block.title}</h3>
          {block.description ? <p className="mt-2 max-w-lg text-sm leading-6 opacity-65">{block.description}</p> : null}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-white/10 bg-black/15 px-3 py-4">
              <strong className="block text-xl font-semibold text-[var(--site-primary)] md:text-2xl">{metric.value}</strong>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.16em] opacity-55">{metric.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-2.5">
      {category ? <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-55">{category}</p> : null}
      {block.icon ? <div className="flex"><BlockIcon name={block.icon} className="h-6 w-6" style={{ color: iconColor }} /></div> : null}
      {block.title ? <h3 className="text-xl font-semibold leading-tight">{block.title}</h3> : null}
      {block.subtitle ? <p className="text-sm font-medium opacity-70">{block.subtitle}</p> : null}
      {block.description ? <p className="line-clamp-4 text-sm leading-6 opacity-75">{block.description}</p> : null}
      {stack.length > 0 ? (
        <div className="mt-1 flex flex-wrap gap-1.5">
          {stack.map((item) => (
            <span key={item} className="rounded-full border border-current/15 px-2 py-1 text-[10px] font-semibold opacity-60">
              {item}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function getMetrics(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    if (typeof record.label !== "string" || typeof record.value !== "string") return [];
    return [{ label: record.label, value: record.value }];
  });
}
