import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function AdminLoginPage() {
  const config = await getSiteConfig();

  return (
    <main className="grid min-h-screen place-items-center bg-[#FAFAFA] px-5">
      <AdminLoginForm projectName={config.settings.projectName} />
    </main>
  );
}
