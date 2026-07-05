import type { Block } from "@/types/block";
import type { Profile } from "@/types/profile";
import type { Section } from "@/types/section";
import type { ThemeConfig } from "@/types/theme";

export type SiteSettings = {
  projectName: string;
  siteTitle: string;
  siteDescription: string;
  siteUrl: string;
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
