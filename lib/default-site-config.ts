import type { SiteConfig } from "@/types/site-config";
import { topLevelBlockSectionId } from "@/lib/utils";

const now = "2026-07-03T00:00:00.000Z";

export const defaultSiteConfig: SiteConfig = {
  version: 1,
  profile: {
    avatarUrl: "/default-avatar.svg",
    displayName: "Your Name",
    username: "",
    headline: "Builder / Designer / Writer",
    bio: "A short introduction about who you are, what you build, and where people can find your work.",
    location: "Your city",
    tags: ["Portfolio", "Projects", "Writing", "Links"],
    email: "",
    socialLinks: [
      {
        id: "github",
        label: "GitHub",
        icon: "github",
        href: "https://github.com/your-handle",
        isVisible: true,
        sortOrder: 1
      },
      {
        id: "x",
        label: "X",
        icon: "twitter",
        href: "https://x.com/",
        isVisible: true,
        sortOrder: 2
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
      contact: true,
      latestPosts: false
    }
  },
  sections: [],
  blocks: [
    {
      id: "text-doing",
      sectionId: topLevelBlockSectionId,
      title: "Featured work",
      subtitle: "Projects, products, and experiments you want people to notice first.",
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
      title: "Flagship project",
      subtitle: "A product or case study",
      description: "Use this block for your main app, startup, portfolio case, or open-source project.",
      size: "large-square",
      coverImage: "",
      icon: "chef-hat",
      badge: "Featured",
      href: "https://example.com",
      actionType: "link",
      openInNewTab: true,
      backgroundColor: "",
      textColor: "",
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
      title: "Side project",
      subtitle: "An experiment or prototype",
      description: "Use this card for a smaller project, design exploration, or work in progress.",
      size: "large-square",
      coverImage: "",
      icon: "map",
      badge: "WIP",
      href: "",
      actionType: "none",
      openInNewTab: false,
      backgroundColor: "",
      textColor: "",
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
      title: "Notes",
      subtitle: "Short updates, writing, and personal highlights.",
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
      title: "Latest note",
      subtitle: "What are you working on right now?",
      description: "Share a short update, announcement, or personal note.",
      size: "wide",
      coverImage: "",
      icon: "activity",
      badge: "MVP",
      href: "",
      actionType: "modal",
      openInNewTab: false,
      backgroundColor: "#F8FAFC",
      textColor: "",
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
      title: "Social",
      subtitle: "",
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
      href: "https://github.com/your-handle",
      actionType: "link",
      openInNewTab: true,
      backgroundColor: "",
      textColor: "",
      metadata: {},
      isVisible: true,
      isFeatured: false,
      sortOrder: 7,
      createdAt: now,
      updatedAt: now
    }
  ],
  theme: {
    primaryColor: "#1677FF",
    backgroundColor: "#FFFFFF",
    cardBackground: "#FFFFFF",
    textColor: "#111111",
    mutedTextColor: "#666666",
    borderColor: "#EAEAEA",
    cardRadius: "2xl",
    cardShadow: "soft",
    fontFamily: "system"
  },
  settings: {
    projectName: "Bio Template Editor",
    siteTitle: "Personal Site Studio",
    siteDescription: "A visual personal homepage template with an editable admin.",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    seoTitle: "",
    seoDescription: "",
    seoCanonicalUrl: "",
    seoOgImage: "",
    enableImagePreview: true,
    enableAnimation: true,
    enablePublicShare: true,
    languages: {
      isEnabled: false,
      mainLocale: "zh-CN",
      languages: [
        { code: "zh-CN", label: "中文", isEnabled: true, sortOrder: 1 }
      ]
    },
    variants: {
      isEnabled: false,
      mainVariantId: "main",
      variants: [
        { id: "main", name: "主版本", accessCode: "", isEnabled: true, sortOrder: 1, mainLocale: "zh-CN", languageSettings: { "zh-CN": { isEnabled: true } } }
      ]
    }
  },
  contentVariants: {},
  updatedAt: now
};
