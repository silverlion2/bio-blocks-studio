import type { ProfileModule } from "@/types/profile";

export const profileModules: ProfileModule[] = [
  "avatar",
  "name",
  "headline",
  "bio",
  "tags",
  "location",
  "socialLinks",
  "contact",
  "latestPosts"
];

export const profileModuleLabels: Record<ProfileModule, string> = {
  avatar: "Avatar",
  name: "Name",
  headline: "Headline",
  bio: "Bio",
  tags: "Tags",
  location: "Location",
  socialLinks: "Social Links",
  contact: "Contact",
  latestPosts: "Latest Posts"
};
