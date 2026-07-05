"use client";

import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";

export function AdminLoginForm({ projectName }: { projectName: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    setIsLoading(false);
    if (!response.ok) {
      setError("Password is incorrect or admin hash is not configured.");
      return;
    }

    toast.success("Logged in");
    router.push("/admin");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-sm p-6">
      <form onSubmit={submit} className="grid gap-5">
        <div className="grid gap-2 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#F1F5F9]">
            <Lock className="h-5 w-5 text-[#1677FF]" />
          </div>
          <h1 className="text-2xl font-semibold">{projectName}</h1>
          <p className="text-sm text-[#64748B]">Enter the admin password to edit this bio site.</p>
        </div>
        <Field label="Password">
          <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus />
        </Field>
        {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        <Button type="submit" disabled={isLoading || !password}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </Card>
  );
}
