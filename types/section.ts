export type SectionLayout = "grid" | "list";
export type SectionGap = "sm" | "md" | "lg";
export type SectionTitleAlign = "left" | "center" | "right";
export type SectionTitleSize = "sm" | "md" | "lg";

export type Section = {
  id: string;
  title: string;
  emoji?: string;
  description?: string;
  titleAlign: SectionTitleAlign;
  titleSize: SectionTitleSize;
  layout: SectionLayout;
  gap: SectionGap;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
};
