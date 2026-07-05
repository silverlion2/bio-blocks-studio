import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Block } from "@/types/block";
import type { Section } from "@/types/section";
import type { SiteConfig } from "@/types/site-config";

export const topLevelBlockSectionId = "__top_level__";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeSortOrder<T extends { sortOrder: number }>(items: T[]): T[] {
  return items.map((item, index) => ({ ...item, sortOrder: index + 1 }));
}

export function bySortOrder<T extends { sortOrder: number }>(a: T, b: T) {
  return a.sortOrder - b.sortOrder;
}

export type ContentOrderItem =
  | { id: "top-level-blocks"; type: "top-level-blocks"; sortOrder: number }
  | { id: string; type: "section"; section: Section; sortOrder: number };

export function buildRenderModel(config: SiteConfig): {
  profile: SiteConfig["profile"];
  orderedSections: Section[];
  blocksBySection: Map<string, Block[]>;
  topLevelBlocks: Block[];
  orderedContentItems: ContentOrderItem[];
} {
  const orderedSections = [...config.sections].filter((section) => section.isVisible).sort(bySortOrder);
  const sectionIds = new Set(orderedSections.map((section) => section.id));
  const blocksBySection = new Map<string, Block[]>();
  const topLevelBlocks: Block[] = [];

  for (const block of config.blocks) {
    if (!block.isVisible) {
      continue;
    }

    if (block.sectionId === topLevelBlockSectionId || !sectionIds.has(block.sectionId)) {
      topLevelBlocks.push(block);
      continue;
    }

    const blocks = blocksBySection.get(block.sectionId) ?? [];
    blocks.push(block);
    blocksBySection.set(block.sectionId, blocks);
  }

  for (const [sectionId, blocks] of blocksBySection.entries()) {
    blocksBySection.set(sectionId, [...blocks].sort(bySortOrder));
  }

  return {
    profile: config.profile,
    orderedSections,
    blocksBySection,
    topLevelBlocks: [...topLevelBlocks].sort(bySortOrder),
    orderedContentItems: [
      ...(topLevelBlocks.length > 0
        ? [{ id: "top-level-blocks" as const, type: "top-level-blocks" as const, sortOrder: config.settings.topLevelBlocksSortOrder ?? 0 }]
        : []),
      ...orderedSections.map((section) => ({ id: section.id, type: "section" as const, section, sortOrder: section.sortOrder }))
    ].sort((a, b) => (a.sortOrder === b.sortOrder ? (a.type === "top-level-blocks" ? -1 : 1) : a.sortOrder - b.sortOrder))
  };
}

export function moveBlockToSection(
  blocks: Block[],
  blockId: string,
  targetSectionId: string,
  targetIndex: number
): Block[] {
  const moving = blocks.find((block) => block.id === blockId);
  if (!moving) {
    return blocks;
  }

  const sourceSectionId = moving.sectionId;
  const withoutMoving = blocks.filter((block) => block.id !== blockId);
  const targetBlocks = withoutMoving
    .filter((block) => block.sectionId === targetSectionId)
    .sort(bySortOrder);
  const boundedIndex = Math.max(0, Math.min(targetIndex, targetBlocks.length));
  targetBlocks.splice(boundedIndex, 0, { ...moving, sectionId: targetSectionId });

  return blocks.map((block) => {
    if (block.id === blockId) {
      const moved = normalizeSortOrder(targetBlocks).find((item) => item.id === blockId);
      return moved ?? block;
    }

    if (block.sectionId === targetSectionId) {
      return normalizeSortOrder(targetBlocks).find((item) => item.id === block.id) ?? block;
    }

    if (block.sectionId === sourceSectionId) {
      const sourceBlocks = normalizeSortOrder(
        withoutMoving.filter((item) => item.sectionId === sourceSectionId).sort(bySortOrder)
      );
      return sourceBlocks.find((item) => item.id === block.id) ?? block;
    }

    return block;
  });
}
