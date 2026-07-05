"use client";

import { ImageUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { uploadFolders, type UploadFolder } from "@/lib/upload";

export function MediaUploader({
  folder = "blocks",
  onUploaded
}: {
  folder?: UploadFolder;
  onUploaded: (url: string) => void;
}) {
  const [selectedFolder, setSelectedFolder] = useState<UploadFolder>(folder);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function upload() {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", selectedFolder);

    setIsUploading(true);
    const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const body = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;
    setIsUploading(false);

    if (!response.ok || !body?.url) {
      toast.error("Upload failed", { description: body?.error ?? "Unknown error" });
      return;
    }

    onUploaded(body.url);
    toast.success("Image uploaded");
  }

  return (
    <div className="grid gap-2 rounded-2xl border border-[#EAEAEA] bg-[#FAFAFA] p-3">
      <div className="grid gap-2 sm:grid-cols-[1fr_150px_auto]">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="text-sm"
        />
        <Select value={selectedFolder} onChange={(event) => setSelectedFolder(event.target.value as UploadFolder)}>
          {uploadFolders.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Button type="button" variant="secondary" onClick={upload} disabled={!file || isUploading}>
          <ImageUp className="h-4 w-4" />
          {isUploading ? "Uploading..." : "Upload"}
        </Button>
      </div>
    </div>
  );
}
