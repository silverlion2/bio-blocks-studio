import type { BlockSize } from "@/types/block";

export const blockSizes: BlockSize[] = [
  "small-square",
  "wide",
  "large-square",
  "full-wide",
  "tall"
];

export const blockSizeLabels: Record<BlockSize, string> = {
  "small-square": "小方块",
  wide: "横向 2 格",
  "large-square": "大方块 2x2",
  "full-wide": "整行",
  tall: "竖向"
};
