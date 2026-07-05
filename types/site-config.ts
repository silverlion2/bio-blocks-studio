import type { Block } from "@/types/block";
import type { Profile } from "@/types/profile";
import type { Section } from "@/types/section";
import type { ThemeConfig } from "@/types/theme";

export type SiteSettings = {
  siteTitle: string;
  siteDescription: string;
  enableImagePreview: boolean;
  enableAnimation: boolean;
  enablePublicShare: boolean;
  topLevelBlocksSortOrder?: number;
};

export type SiteConfig = {
  version: number;
  profile: Profile;
  sections: Section[];
  blocks: Block[];
  theme: ThemeConfig;
  settings: SiteSettings;
  updatedAt: string;
};
