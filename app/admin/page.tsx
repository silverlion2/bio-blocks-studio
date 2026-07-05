import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getCurrentSessionIsValid } from "@/lib/auth";
import { getSiteConfig } from "@/lib/site-config";

export default async function AdminPage() {
  if (!(await getCurrentSessionIsValid())) {
    redirect("/admin/login");
  }

  const config = await getSiteConfig();
  return <AdminShell initialConfig={config} />;
}
