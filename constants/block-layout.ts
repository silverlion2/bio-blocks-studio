import type { Block, BlockSize, LayoutDevice } from "@/types/block";

export const blockGridClass = "block-grid grid grid-flow-dense grid-cols-2 gap-4 md:grid-cols-3";

export const blockGridClassByDevice: Record<LayoutDevice, string> = {
  desktop: "admin-block-grid grid gap-4",
  mobile: "admin-block-grid grid gap-4"
};

export const blockSizeClassByDevice: Record<LayoutDevice, Record<BlockSize, string>> = {
  desktop: {
    "small-square": "col-span-4 row-span-1",
    wide: "col-span-8 row-span-1",
    "large-square": "col-span-8 row-span-2",
    "full-wide": "col-span-12 row-span-1",
    tall: "col-span-4 row-span-2"
  },
  mobile: {
    "small-square": "col-span-6 row-span-1",
    wide: "col-span-12 row-span-1",
    "large-square": "col-span-12 row-span-2",
    "full-wide": "col-span-12 row-span-1",
    tall: "col-span-6 row-span-2"
  }
};

export const blockSizeClass = blockSizeClassByDevice.desktop;

const publicMobileBlockSizeClass: Record<BlockSize, string> = {
  "small-square": "col-span-1 row-span-1",
  wide: "col-span-2 row-span-1",
  "large-square": "col-span-2 row-span-2",
  "full-wide": "col-span-2 row-span-1",
  tall: "col-span-1 row-span-2"
};

const publicDesktopBlockSizeClass: Record<BlockSize, string> = {
  "small-square": "md:col-span-1 md:row-span-1",
  wide: "md:col-span-2 md:row-span-1",
  "large-square": "md:col-span-2 md:row-span-2",
  "full-wide": "md:col-span-3 md:row-span-1",
  tall: "md:col-span-1 md:row-span-2"
};

export function getBlockSize(block: Block, device: LayoutDevice) {
  return block.responsiveSizes?.[device] ?? block.size;
}

export function getPublicBlockSizeClass(block: Block) {
  const mobileSize = getBlockSize(block, "mobile");
  const desktopSize = getBlockSize(block, "desktop");
  return `${publicMobileBlockSizeClass[mobileSize]} ${publicDesktopBlockSizeClass[desktopSize]}`;
}
