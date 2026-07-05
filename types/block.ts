export type BlockType =
  | "link"
  | "project"
  | "image"
  | "text"
  | "social"
  | "video"
  | "status";

export type BlockSize = "small-square" | "wide" | "large-square" | "full-wide" | "tall";
export type LayoutDevice = "desktop" | "mobile";

export type BlockActionType =
  | "none"
  | "link"
  | "image-preview"
  | "modal"
  | "copy"
  | "download";

export type Block = {
  id: string;
  sectionId: string;
  title: string;
  subtitle?: string;
  description?: string;
  type: BlockType;
  size: BlockSize;
  responsiveSizes?: Partial<Record<LayoutDevice, BlockSize>>;
  coverImage?: string;
  icon?: string;
  badge?: string;
  href?: string;
  actionType: BlockActionType;
  openInNewTab?: boolean;
  backgroundColor?: string;
  textColor?: string;
  metadata?: Record<string, unknown>;
  isVisible: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};
