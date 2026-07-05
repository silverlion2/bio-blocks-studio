"use client";

import { Copy, Github, Globe2, Instagram, LinkIcon, Linkedin, Mail, MapPin, Twitter, Youtube } from "lucide-react";
import { toast } from "sonner";
import type { Profile, ProfileModule } from "@/types/profile";
import { cn } from "@/lib/utils";

function Icon({ name }: { name?: string }) {
  const iconClass = "h-4 w-4";
  if (name === "github") return <Github className={iconClass} />;
  if (name === "twitter" || name === "x") return <Twitter className={iconClass} />;
  if (name === "instagram") return <Instagram className={iconClass} />;
  if (name === "linkedin") return <Linkedin className={iconClass} />;
  if (name === "youtube") return <Youtube className={iconClass} />;
  if (name === "website" || name === "globe") return <Globe2 className={iconClass} />;
  return <LinkIcon className={iconClass} />;
}

export function ProfileModuleRenderer({ module, profile }: { module: ProfileModule; profile: Profile }) {
  switch (module) {
    case "avatar":
      return (
        <img
          src={profile.avatarUrl || "/default-avatar.svg"}
          alt={profile.displayName}
          className="h-32 w-32 rounded-full border border-[#EAEAEA] object-cover shadow-soft"
        />
      );
    case "name":
      return (
        <div className="grid gap-1">
          <h1 className="text-3xl font-semibold tracking-normal">{profile.displayName}</h1>
          {profile.username ? <p className="text-sm text-[var(--site-muted)]">@{profile.username}</p> : null}
        </div>
      );
    case "headline":
      return <p className="text-base font-medium text-[#333]">{profile.headline}</p>;
    case "bio":
      return <p className="text-sm leading-7 text-[var(--site-muted)]">{profile.bio}</p>;
    case "tags":
      return (
        <div className="flex flex-wrap gap-2">
          {profile.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-[#F1F5F9] px-3 py-1 text-xs font-medium text-[#475569]">
              {tag}
            </span>
          ))}
        </div>
      );
    case "location":
      return profile.location ? (
        <div className="flex items-center gap-2 text-sm text-[var(--site-muted)]">
          <MapPin className="h-4 w-4" />
          <span>{profile.location}</span>
        </div>
      ) : null;
    case "socialLinks":
      return (
        <div className="flex flex-wrap gap-2">
          {[...profile.socialLinks]
            .filter((link) => link.isVisible)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((link) => {
              const className =
                "inline-flex items-center gap-2 rounded-full border border-[#EAEAEA] bg-white px-3 py-2 text-sm font-medium text-[#333] transition hover:border-[#1677FF]/40 hover:text-[#1677FF]";

              if (link.actionType === "copy") {
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(link.copyText || link.href || link.label);
                      toast.success("Copied");
                    }}
                    className={className}
                  >
                    <Icon name={link.icon} />
                    {link.label}
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                );
              }

              return (
                <a
                  key={link.id}
                  href={link.href}
                  target={link.openInNewTab === false ? "_self" : "_blank"}
                  rel="noreferrer"
                  className={className}
                >
                  <Icon name={link.icon} />
                  {link.label}
                </a>
              );
            })}
        </div>
      );
    case "contact":
      return profile.email && profile.email !== "example@example.com" ? (
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(profile.email ?? "");
            toast.success("Email copied");
          }}
          className={cn(
            "inline-flex w-fit items-center gap-2 rounded-full border border-[#EAEAEA] bg-white px-3 py-2 text-sm font-medium text-[#333]",
            "transition hover:border-[#1677FF]/40 hover:text-[#1677FF]"
          )}
        >
          <Mail className="h-4 w-4" />
          {profile.email}
          <Copy className="h-3.5 w-3.5" />
        </button>
      ) : null;
    case "latestPosts":
      return <p className="text-sm text-[var(--site-muted)]">Latest posts will appear here.</p>;
    default:
      return null;
  }
}
