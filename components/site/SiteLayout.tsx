import type { Block } from "@/types/block";
import type { Section } from "@/types/section";
import type { SiteConfig } from "@/types/site-config";
import type { ContentOrderItem } from "@/lib/utils";
import { ContentArea } from "@/components/site/ContentArea";
import { ProfilePanel } from "@/components/site/ProfilePanel";

type RenderModel = {
  profile: SiteConfig["profile"];
  orderedSections: Section[];
  blocksBySection: Map<string, Block[]>;
  topLevelBlocks: Block[];
  orderedContentItems: ContentOrderItem[];
};

export function SiteLayout({ config, renderModel }: { config: SiteConfig; renderModel: RenderModel }) {
  const theme = config.theme;
  return (
    <main
      style={
        {
          "--site-bg": theme.backgroundColor,
          "--site-card": theme.cardBackground,
          "--site-text": theme.textColor,
          "--site-muted": theme.mutedTextColor,
          "--site-border": theme.borderColor,
          "--site-primary": theme.primaryColor
        } as React.CSSProperties
      }
      className="min-h-screen bg-[var(--site-bg)] text-[var(--site-text)]"
    >
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-8 px-5 pb-24 pt-10 md:px-8 md:pt-16 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-12">
        <ProfilePanel profile={renderModel.profile} />
        <ContentArea
          sections={renderModel.orderedSections}
          blocksBySection={renderModel.blocksBySection}
          topLevelBlocks={renderModel.topLevelBlocks}
          orderedContentItems={renderModel.orderedContentItems}
        />
      </div>
    </main>
  );
}
