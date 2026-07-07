import type { CSSProperties } from "react";
import type { Block, BlockSize, LayoutDevice } from "@/types/block";
import type { ContentOrderItem } from "@/lib/utils";
import { isSectionTextBlock } from "@/lib/utils";
import {
  getBlockLogicalColumnStart,
  getBlockColumnStart,
  getBlockRowStart,
  getBlockSize,
  getCompactedBlockGridStyles,
  getDefaultGridSpan,
  getDefaultRowSpan
} from "@/constants/block-layout";

export type PublicDesktopContentColumns = 2 | 3;

const desktopGridSpanPerLogicalColumn = 4;
const desktopContentWidthByColumns: Record<PublicDesktopContentColumns, string> = {
  2: "536px",
  3: "812px"
};

export function getPublicDesktopContentColumns(contentItems: ContentOrderItem[]): PublicDesktopContentColumns {
  const usedColumns = contentItems.reduce((maxColumns, item) => {
    if (item.type !== "top-level-blocks") return maxColumns;
    return Math.max(maxColumns, getDesktopBlockGroupColumnCount(item.blocks));
  }, 0);

  return usedColumns >= 3 ? 3 : 2;
}

export function getPublicDesktopContentWidth(columns: PublicDesktopContentColumns) {
  return desktopContentWidthByColumns[columns];
}

export function getPublicCompactedBlockGridStyles(
  blocks: Block[],
  device: LayoutDevice,
  desktopContentColumns: PublicDesktopContentColumns
): Map<string, CSSProperties> {
  if (device === "mobile" || desktopContentColumns === 3) {
    return getCompactedBlockGridStyles(blocks.map((block) => ({ id: block.id, block })), device);
  }

  return getCompactedPublicDesktopBlockGridStyles(blocks, desktopContentColumns);
}

export function getPublicBlockPlacementStyle(
  block: Block,
  desktopContentColumns: PublicDesktopContentColumns,
  compacted?: Partial<Record<LayoutDevice, CSSProperties>>
): CSSProperties & Record<string, string | number | undefined> {
  const mobileSize = getBlockSize(block, "mobile");
  const desktopSize = getBlockSize(block, "desktop");
  const mobileColumnStart = compacted?.mobile?.gridColumnStart ?? getBlockPublicColumnStart(block, "mobile", desktopContentColumns);
  const desktopColumnStart =
    compacted?.desktop?.gridColumnStart ?? getBlockPublicColumnStart(block, "desktop", desktopContentColumns);
  const mobileRowStart = compacted?.mobile?.gridRowStart ?? getBlockRowStart(block, "mobile");
  const desktopRowStart = compacted?.desktop?.gridRowStart ?? getBlockRowStart(block, "desktop");
  const mobileColumnEnd = compacted?.mobile?.gridColumnEnd ?? `span ${getDefaultGridSpan(mobileSize, "mobile")}`;
  const desktopColumnEnd =
    compacted?.desktop?.gridColumnEnd ?? `span ${getPublicDesktopGridSpan(desktopSize, desktopContentColumns)}`;
  const mobileRowEnd = compacted?.mobile?.gridRowEnd ?? `span ${getDefaultRowSpan(mobileSize)}`;
  const desktopRowEnd = compacted?.desktop?.gridRowEnd ?? `span ${getDefaultRowSpan(desktopSize)}`;

  return {
    "--block-mobile-column-start": mobileColumnStart,
    "--block-mobile-column-end": mobileColumnEnd,
    "--block-desktop-column-start": desktopColumnStart,
    "--block-desktop-column-end": desktopColumnEnd,
    "--block-mobile-row-start": mobileRowStart,
    "--block-mobile-row-end": mobileRowEnd,
    "--block-desktop-row-start": desktopRowStart,
    "--block-desktop-row-end": desktopRowEnd
  };
}

function getDesktopBlockGroupColumnCount(blocks: Block[]) {
  const displayBlocks = blocks.filter((block) => !isSectionTextBlock(block));
  if (displayBlocks.length === 0) return 0;

  const compactedStyles = getCompactedBlockGridStyles(
    displayBlocks.map((block) => ({ id: block.id, block })),
    "desktop"
  );

  return displayBlocks.reduce((maxColumns, block) => {
    const style = compactedStyles.get(block.id);
    const columnStart = getGridColumnStart(style?.gridColumnStart);
    const columnSpan = getGridColumnSpan(style?.gridColumnEnd, block);
    const logicalColumnEnd = Math.ceil((columnStart - 1 + columnSpan) / desktopGridSpanPerLogicalColumn);

    return Math.max(maxColumns, Math.min(3, logicalColumnEnd));
  }, 0);
}

function getGridColumnStart(value: CSSProperties["gridColumnStart"]) {
  return typeof value === "number" && Number.isFinite(value) ? value : Number(value) || 1;
}

function getGridColumnSpan(value: CSSProperties["gridColumnEnd"], block: Block) {
  if (typeof value === "string") {
    const match = value.match(/span\s+(\d+)/);
    if (match) return Number(match[1]);
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return getDefaultGridSpan(getBlockSize(block, "desktop"), "desktop");
}

type GridPlacement = {
  column: number;
  row: number;
  columnSpan: number;
  rowSpan: number;
};

function getCompactedPublicDesktopBlockGridStyles(
  blocks: Block[],
  desktopContentColumns: PublicDesktopContentColumns
): Map<string, CSSProperties> {
  const placements = new Map<string, GridPlacement>();
  const occupied: boolean[][] = [];

  for (const block of blocks) {
    const size = getBlockSize(block, "desktop");
    const columnSpan = getPublicDesktopGridSpan(size, desktopContentColumns);
    const rowSpan = getDefaultRowSpan(size);
    const preferredColumn = getBlockPublicColumnStart(block, "desktop", desktopContentColumns);
    const preferredRow = getBlockRowStart(block, "desktop");
    const placement = placeGridItem(occupied, 12, columnSpan, rowSpan, preferredColumn, preferredRow);
    placements.set(block.id, placement);
  }

  const occupiedRows = new Set<number>();
  for (const placement of placements.values()) {
    for (let row = placement.row; row < placement.row + placement.rowSpan; row += 1) {
      occupiedRows.add(row);
    }
  }

  const compactedRowByOriginal = new Map<number, number>();
  [...occupiedRows]
    .sort((a, b) => a - b)
    .forEach((row, index) => compactedRowByOriginal.set(row, index));

  const styles = new Map<string, CSSProperties>();
  for (const [id, placement] of placements.entries()) {
    styles.set(id, {
      gridColumnStart: placement.column + 1,
      gridColumnEnd: `span ${placement.columnSpan}`,
      gridRowStart: (compactedRowByOriginal.get(placement.row) ?? placement.row) + 1,
      gridRowEnd: `span ${placement.rowSpan}`
    });
  }

  return styles;
}

function getBlockPublicColumnStart(
  block: Block,
  device: LayoutDevice,
  desktopContentColumns: PublicDesktopContentColumns
) {
  if (device === "mobile") return getBlockColumnStart(block, "mobile");

  const logicalColumnStart = getBlockLogicalColumnStart(block, "desktop");
  if (!logicalColumnStart) return undefined;

  const size = getBlockSize(block, "desktop");
  const logicalSpan = getPublicDesktopLogicalSpan(size, desktopContentColumns);
  const maxColumnStart = desktopContentColumns - logicalSpan + 1;
  const clampedLogicalColumnStart = Math.max(1, Math.min(maxColumnStart, logicalColumnStart));
  const baseSpan = 12 / desktopContentColumns;

  return (clampedLogicalColumnStart - 1) * baseSpan + 1;
}

function getPublicDesktopGridSpan(size: BlockSize, desktopContentColumns: PublicDesktopContentColumns) {
  if (desktopContentColumns === 3) return getDefaultGridSpan(size, "desktop");
  return size === "small-square" || size === "tall" ? 6 : 12;
}

function getPublicDesktopLogicalSpan(size: BlockSize, desktopContentColumns: PublicDesktopContentColumns) {
  return getPublicDesktopGridSpan(size, desktopContentColumns) / (12 / desktopContentColumns);
}

function placeGridItem(
  occupied: boolean[][],
  columns: number,
  rawColumnSpan: number,
  rawRowSpan: number,
  rawColumnStart?: number,
  rawRowStart?: number
): GridPlacement {
  const columnSpan = Math.max(1, Math.min(columns, rawColumnSpan));
  const rowSpan = Math.max(1, rawRowSpan);
  const preferredColumn = rawColumnStart ? Math.max(0, Math.min(columns - columnSpan, rawColumnStart - 1)) : null;
  const preferredRow = rawRowStart ? Math.max(0, Math.min(239, rawRowStart - 1)) : null;
  const rowsToTry =
    preferredRow === null
      ? Array.from({ length: 240 }, (_, row) => row)
      : [preferredRow, ...Array.from({ length: 240 }, (_, row) => row).filter((row) => row !== preferredRow)];

  for (const row of rowsToTry) {
    ensureGridRows(occupied, row + rowSpan, columns);
    const columnsToTry =
      preferredColumn === null
        ? Array.from({ length: columns - columnSpan + 1 }, (_, column) => column)
        : [
            preferredColumn,
            ...Array.from({ length: columns - columnSpan + 1 }, (_, column) => column).filter(
              (column) => column !== preferredColumn
            )
          ];

    for (const column of columnsToTry) {
      if (!canPlaceGridItem(occupied, column, row, columnSpan, rowSpan)) continue;
      occupyGridItem(occupied, column, row, columnSpan, rowSpan);
      return { column, row, columnSpan, rowSpan };
    }
  }

  return { column: 0, row: occupied.length, columnSpan, rowSpan };
}

function ensureGridRows(occupied: boolean[][], rowCount: number, columns: number) {
  while (occupied.length < rowCount) {
    occupied.push(Array.from({ length: columns }, () => false));
  }
}

function canPlaceGridItem(
  occupied: boolean[][],
  column: number,
  row: number,
  columnSpan: number,
  rowSpan: number
) {
  for (let rowOffset = 0; rowOffset < rowSpan; rowOffset += 1) {
    for (let columnOffset = 0; columnOffset < columnSpan; columnOffset += 1) {
      if (occupied[row + rowOffset]?.[column + columnOffset]) return false;
    }
  }
  return true;
}

function occupyGridItem(occupied: boolean[][], column: number, row: number, columnSpan: number, rowSpan: number) {
  for (let rowOffset = 0; rowOffset < rowSpan; rowOffset += 1) {
    for (let columnOffset = 0; columnOffset < columnSpan; columnOffset += 1) {
      occupied[row + rowOffset][column + columnOffset] = true;
    }
  }
}
