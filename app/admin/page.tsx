import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AdminShell } from "@/components/admin/AdminShell";
import { getCurrentSessionIsValid } from "@/lib/auth";
import { isRemotePersistenceConfigured } from "@/lib/blob-config";
import { getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function AdminPage() {
  if (!(await getCurrentSessionIsValid())) {
    redirect("/admin/login");
  }

  const config = await getSiteConfig((await headers()).get("accept-language"));
  return <AdminShell initialConfig={config} remotePersistenceAvailable={isRemotePersistenceConfigured()} />;
}
