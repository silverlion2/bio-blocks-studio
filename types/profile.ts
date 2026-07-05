export type ProfileModule =
  | "avatar"
  | "name"
  | "headline"
  | "bio"
  | "tags"
  | "location"
  | "socialLinks"
  | "contact"
  | "latestPosts";

export type SocialLink = {
  id: string;
  label: string;
  icon?: string;
  href: string;
  actionType?: "link" | "copy";
  copyText?: string;
  openInNewTab?: boolean;
  isVisible: boolean;
  sortOrder: number;
};

export type Profile = {
  avatarUrl: string;
  displayName: string;
  username?: string;
  headline: string;
  bio: string;
  location?: string;
  tags: string[];
  email?: string;
  socialLinks: SocialLink[];
  moduleOrder: ProfileModule[];
  visibleModules: Record<ProfileModule, boolean>;
};
