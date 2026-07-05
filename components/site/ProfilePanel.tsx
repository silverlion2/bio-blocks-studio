import type { Profile } from "@/types/profile";
import { ProfileModuleRenderer } from "@/components/site/ProfileModuleRenderer";

export function ProfilePanel({ profile }: { profile: Profile }) {
  return (
    <aside className="lg:sticky lg:top-10 lg:self-start">
      <div className="grid gap-5 p-1">
        {profile.moduleOrder.map((module) =>
          profile.visibleModules[module] ? (
            <ProfileModuleRenderer key={module} module={module} profile={profile} />
          ) : null
        )}
      </div>
    </aside>
  );
}
