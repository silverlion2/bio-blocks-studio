import type { SiteConfig } from "@/types/site-config";
import { AdminVisualEditor } from "@/components/admin/AdminVisualEditor";

export function AdminShell({
  initialConfig,
  remotePersistenceAvailable
}: {
  initialConfig: SiteConfig;
  remotePersistenceAvailable: boolean;
}) {
  return (
    <AdminVisualEditor
      key={initialConfig.updatedAt}
      initialConfig={initialConfig}
      remotePersistenceAvailable={remotePersistenceAvailable}
    />
  );
}
