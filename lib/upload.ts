export const uploadFolders = ["avatar", "blocks", "gallery", "qrcode"] as const;
export type UploadFolder = (typeof uploadFolders)[number];

export const maxUploadSize = 5 * 1024 * 1024;
export const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const fileExtensionsByMimeType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif"
};

export function isUploadFolder(value: string): value is UploadFolder {
  return uploadFolders.includes(value as UploadFolder);
}

export function getFileExtensionForType(mimeType: string) {
  return fileExtensionsByMimeType[mimeType] ?? "bin";
}
