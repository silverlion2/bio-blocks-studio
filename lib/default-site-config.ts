import type { SiteConfig } from "@/types/site-config";
import { topLevelBlockSectionId } from "@/lib/utils";

const now = "2026-07-03T00:00:00.000Z";

export const defaultSiteConfig: SiteConfig = {
  version: 1,
  profile: {
    avatarUrl: "https://avatars.githubusercontent.com/u/10691641?v=4",
    displayName: "Silverlion",
    username: "silverlion2",
    headline: "Independent builder · AI systems · data products",
    bio: "I turn complex domains into focused digital tools — from market intelligence and healthcare navigation to music discovery and creative AI.",
    location: "Shanghai · building on the web",
    tags: ["AI Agents", "Data Products", "Fintech", "Healthcare", "Music Tech"],
    email: "",
    socialLinks: [
      {
        id: "github",
        label: "GitHub",
        icon: "github",
        href: "https://github.com/silverlion2",
        isVisible: true,
        sortOrder: 1
      }
    ],
    moduleOrder: [
      "avatar",
      "name",
      "headline",
      "bio",
      "tags",
      "location",
      "socialLinks",
      "contact"
    ],
    visibleModules: {
      avatar: true,
      name: true,
      headline: true,
      bio: true,
      tags: true,
      location: true,
      socialLinks: true,
      contact: false,
      latestPosts: false
    }
  },
  sections: [],
  blocks: [
    {
      id: "text-doing",
      sectionId: topLevelBlockSectionId,
      title: "Selected signals",
      subtitle: "Live products and open experiments across markets, culture, health, and AI.",
      description: "",
      size: "section-text",
      responsiveSizes: {
        desktop: "section-text",
        mobile: "section-text"
      },
      coverImage: "",
      icon: "build",
      badge: "",
      href: "",
      actionType: "none",
      openInNewTab: false,
      backgroundColor: "",
      textColor: "",
      metadata: {
        sourceSectionId: "doing",
        titleAlign: "left",
        titleSize: "md"
      },
      sortOrder: 1,
      isVisible: true,
      isFeatured: false,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "flagship-project",
      sectionId: topLevelBlockSectionId,
      title: "Options Radar",
      subtitle: "Market structure, made legible",
      description: "A trading dashboard for gamma exposure, max pain, call and put walls, ticker analysis, and trader risk education.",
      size: "large-square",
      coverImage: "",
      icon: "activity",
      badge: "LIVE · FINTECH",
      href: "https://my-trading-app-xi.vercel.app",
      actionType: "link",
      openInNewTab: true,
      backgroundColor: "#14200F",
      textColor: "#F3FFE8",
      metadata: {},
      isVisible: true,
      isFeatured: true,
      sortOrder: 2,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "health-trip",
      sectionId: topLevelBlockSectionId,
      title: "Shanghai Rave Index",
      subtitle: "The underground, indexed",
      description: "A living 2026 calendar and guide for Shanghai techno, house, bass, trance, DJs, venues, tickets, and poster culture.",
      size: "large-square",
      coverImage: "",
      icon: "map",
      badge: "LIVE · CULTURE",
      href: "https://raveindexsh.top/",
      actionType: "link",
      openInNewTab: true,
      backgroundColor: "#15131F",
      textColor: "#F7F2FF",
      metadata: {},
      isVisible: true,
      isFeatured: false,
      sortOrder: 3,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "text-daily",
      sectionId: topLevelBlockSectionId,
      title: "More from the lab",
      subtitle: "Tools for specialized decisions, creative workflows, and intelligent systems.",
      description: "",
      size: "section-text",
      responsiveSizes: {
        desktop: "section-text",
        mobile: "section-text"
      },
      coverImage: "",
      icon: "sparkle",
      badge: "",
      href: "",
      actionType: "none",
      openInNewTab: false,
      backgroundColor: "",
      textColor: "",
      metadata: {
        sourceSectionId: "daily",
        titleAlign: "left",
        titleSize: "md"
      },
      isVisible: true,
      isFeatured: false,
      sortOrder: 4,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "daily-note",
      sectionId: topLevelBlockSectionId,
      title: "BioQuantix",
      subtitle: "Biopharma intelligence terminal",
      description: "AI-assisted discovery of acquisition targets, clinical milestones, pipeline gaps, and emerging asset signals.",
      size: "wide",
      coverImage: "",
      icon: "sparkle",
      badge: "AI · BIOPHARMA",
      href: "https://pharma-hunter-web.vercel.app",
      actionType: "link",
      openInNewTab: false,
      backgroundColor: "#101A1A",
      textColor: "#E9FFFF",
      metadata: {},
      isVisible: true,
      isFeatured: false,
      sortOrder: 5,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "text-social",
      sectionId: topLevelBlockSectionId,
      title: "Open source trail",
      subtitle: "Code, experiments, and the systems behind the work.",
      description: "",
      size: "section-text",
      responsiveSizes: {
        desktop: "section-text",
        mobile: "section-text"
      },
      coverImage: "",
      icon: "link",
      badge: "",
      href: "",
      actionType: "none",
      openInNewTab: false,
      backgroundColor: "",
      textColor: "",
      metadata: {
        sourceSectionId: "social",
        titleAlign: "left",
        titleSize: "md"
      },
      isVisible: true,
      isFeatured: false,
      sortOrder: 6,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "github",
      sectionId: topLevelBlockSectionId,
      title: "GitHub",
      subtitle: "",
      description: "",
      size: "small-square",
      coverImage: "",
      icon: "github",
      badge: "",
      href: "https://github.com/silverlion2",
      actionType: "link",
      openInNewTab: true,
      backgroundColor: "#B7FF3C",
      textColor: "#071006",
      metadata: {},
      isVisible: true,
      isFeatured: false,
      sortOrder: 7,
      createdAt: now,
      updatedAt: now
    }
  ],
  theme: {
    primaryColor: "#B7FF3C",
    backgroundColor: "#080B09",
    cardBackground: "#111612",
    textColor: "#F3F7F1",
    mutedTextColor: "#98A39A",
    borderColor: "#29322B",
    cardRadius: "2xl",
    cardShadow: "soft",
    fontFamily: "system"
  },
  settings: {
    projectName: "Silverlion Signal Studio",
    siteTitle: "Silverlion — Independent Builder",
    siteDescription: "Independent builder creating AI systems, data products, market tools, healthcare experiences, and music technology.",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    seoTitle: "Silverlion — AI Systems & Data Products",
    seoDescription: "Selected products and experiments by Silverlion across AI, fintech, healthcare, and music technology.",
    seoCanonicalUrl: "",
    seoOgImage: "",
    enableImagePreview: true,
    enableAnimation: true,
    enablePublicShare: true,
    languages: {
      isEnabled: false,
      mainLocale: "en",
      languages: [
        { code: "en", label: "English", isEnabled: true, sortOrder: 1 }
      ]
    },
    variants: {
      isEnabled: false,
      mainVariantId: "main",
      variants: [
        {
          id: "main",
          name: "Main version",
          accessCode: "",
          isEnabled: true,
          allowSeoIndex: true,
          sortOrder: 1,
          mainLocale: "en",
          languages: [{ code: "en", label: "English", isEnabled: true, sortOrder: 1 }],
          languageSettings: { en: { isEnabled: true } }
        }
      ]
    }
  },
  contentVariants: {},
  updatedAt: now
};

export function getDefaultSiteConfig(languageTag?: string | null): SiteConfig {
  const config = structuredClone(defaultSiteConfig);
  if (languageTag !== "__unused_translation_preview__") return config;

  config.profile = {
    ...config.profile,
    displayName: "你的名字",
    headline: "创作者 / 设计师 / 写作者",
    bio: "用一小段文字介绍你是谁、你在做什么，以及大家在哪里可以找到你。",
    location: "你的城市",
    tags: ["作品集", "项目", "写作", "链接"],
    socialLinks: config.profile.socialLinks.map((link) => link.id === "x" ? { ...link, label: "X" } : link)
  };
  config.blocks = config.blocks.map((block) => {
    const translated: Record<string, Partial<typeof block>> = {
      "text-doing": { title: "精选作品", subtitle: "把你最希望大家先看到的项目、产品和实验放在这里。" },
      "flagship-project": { title: "代表项目", subtitle: "一个产品或案例研究", description: "用这个区块展示你的主力应用、创业项目、作品集案例或开源项目。", badge: "精选" },
      "health-trip": { title: "个人项目", subtitle: "一个实验或原型", description: "用这个卡片展示较小的项目、设计探索或进行中的作品。", badge: "进行中" },
      "text-daily": { title: "随笔", subtitle: "短动态、写作和个人亮点。" },
      "daily-note": { title: "最新动态", subtitle: "你最近在做什么？", description: "分享一条简短的动态、公告或个人近况。", badge: "MVP" },
      "text-social": { title: "社交链接" }
    };
    return { ...block, ...(translated[block.id] ?? {}) };
  });
  config.settings = {
    ...config.settings,
    projectName: "个人主页编辑器",
    siteTitle: "个人主页工作室",
    siteDescription: "一个带可视化编辑器的个人主页模板。",
    languages: {
      isEnabled: false,
      mainLocale: "zh-CN",
      languages: [{ code: "zh-CN", label: "中文", isEnabled: true, sortOrder: 1 }]
    },
    variants: {
      isEnabled: false,
      mainVariantId: "main",
      variants: [{
        id: "main",
        name: "主版本",
        accessCode: "",
        isEnabled: true,
        allowSeoIndex: true,
        sortOrder: 1,
        mainLocale: "zh-CN",
        languages: [{ code: "zh-CN", label: "中文", isEnabled: true, sortOrder: 1 }],
        languageSettings: { "zh-CN": { isEnabled: true } }
      }]
    }
  };
  return config;
}
