import type { Block } from "@/types/block";
import type { SiteConfig, SiteLanguage } from "@/types/site-config";
import type { ContentOrderItem } from "@/lib/utils";
import { ContentArea } from "@/components/site/ContentArea";
import { ProfilePanel } from "@/components/site/ProfilePanel";
import { PublicLanguageSwitcher } from "@/components/site/PublicLanguageSwitcher";
import { getPublicDesktopContentColumns, getPublicDesktopContentWidth } from "@/lib/public-content-layout";

type RenderModel = {
  profile: SiteConfig["profile"];
  topLevelBlocks: Block[];
  orderedContentItems: ContentOrderItem[];
};

type SiteLayoutProps = {
  config: SiteConfig;
  renderModel: RenderModel;
  languageSwitcher?: {
    currentLocale: string;
    languages: SiteLanguage[];
    accessCode: string;
    initialPreparingLocale?: string;
  };
};

export function SiteLayout({ config, renderModel, languageSwitcher }: SiteLayoutProps) {
  const theme = config.theme;
  const desktopContentColumns = getPublicDesktopContentColumns(renderModel.orderedContentItems);
  const desktopContentWidth = getPublicDesktopContentWidth(desktopContentColumns);

  return (
    <main
      style={
        {
          "--site-bg": theme.backgroundColor,
          "--site-card": theme.cardBackground,
          "--site-text": theme.textColor,
          "--site-muted": theme.mutedTextColor,
          "--site-border": theme.borderColor,
          "--site-primary": theme.primaryColor,
          "--site-content-max-width": desktopContentWidth,
          "--site-shell-max-width": `calc(320px + 3rem + ${desktopContentWidth})`
        } as React.CSSProperties
      }
      className="public-site-shell min-h-screen bg-[var(--site-bg)] text-[var(--site-text)]"
    >
      {languageSwitcher ? (
        <PublicLanguageSwitcher
          currentLocale={languageSwitcher.currentLocale}
          languages={languageSwitcher.languages}
          accessCode={languageSwitcher.accessCode}
          initialPreparingLocale={languageSwitcher.initialPreparingLocale}
          className="fixed left-4 top-4 z-40 md:left-6 md:top-6"
        />
      ) : null}
      <div className="mx-auto grid w-full max-w-[1180px] grid-cols-1 gap-8 px-5 pb-24 pt-10 md:px-8 md:pt-16 lg:max-w-[var(--site-shell-max-width)] lg:grid-cols-[320px_minmax(0,var(--site-content-max-width))] lg:gap-12">
        <ProfilePanel profile={renderModel.profile} />
        <ContentArea
          topLevelBlocks={renderModel.topLevelBlocks}
          orderedContentItems={renderModel.orderedContentItems}
          desktopContentColumns={desktopContentColumns}
        />
      </div>
    </main>
  );
}
