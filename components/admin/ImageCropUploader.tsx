"use client";

import { ImageUp, RotateCcw, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { type UploadFolder } from "@/lib/upload";
import { cn } from "@/lib/utils";

type CropShape = "rounded" | "circle";
type FixedCropRatio = "1:1" | "4:3" | "16:9" | "3:4";
type CropRatio = FixedCropRatio | "custom";
type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};
type CropDragMode = "move" | "nw" | "ne" | "sw" | "se";
type MediaBounds = {
  left: number;
  top: number;
  width: number;
  height: number;
};

const ratioValues: Record<FixedCropRatio, number> = {
  "1:1": 1,
  "4:3": 4 / 3,
  "16:9": 16 / 9,
  "3:4": 3 / 4
};

export function ImageCropUploader({
  folder,
  value,
  shape = "rounded",
  label = "封面/cover",
  buttonText = "更换图片",
  buttonIconOnly = false,
  buttonClassName,
  previewClassName,
  presentation = "compact",
  onUploaded,
  onClear
}: {
  folder: UploadFolder;
  value?: string;
  shape?: CropShape;
  label?: string;
  buttonText?: string;
  buttonIconOnly?: boolean;
  buttonClassName?: string;
  previewClassName?: string;
  presentation?: "compact" | "coverDropzone";
  onUploaded: (url: string) => void;
  onClear?: () => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [objectUrl, setObjectUrl] = useState("");
  const [cropRect, setCropRect] = useState<CropRect>({ x: 15, y: 15, width: 70, height: 70 });
  const [mediaBounds, setMediaBounds] = useState<MediaBounds | null>(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [ratio, setRatio] = useState<CropRatio>("1:1");
  const [rotation, setRotation] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isPasteTargetActive, setIsPasteTargetActive] = useState(false);
  const objectUrlRef = useRef("");
  const activeRatio = shape === "circle" ? "1:1" : ratio;
  const isCustomRatio = activeRatio === "custom";
  const mediaAspect = mediaBounds && mediaBounds.height > 0 ? mediaBounds.width / mediaBounds.height : 1;
  const activeRatioValue = isCustomRatio ? getCropRectAspect(cropRect, mediaAspect) : ratioValues[activeRatio];

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  function chooseFile(nextFile: File | null) {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = "";
    }

    setFile(nextFile);
    setRatio("1:1");
    setRotation(0);
    setCropRect(fitCropToAspect({ x: 15, y: 15, width: 70, height: 70 }, 1, 1));
    setMediaBounds(null);
    setNaturalSize({ width: 0, height: 0 });

    if (!nextFile) {
      setObjectUrl("");
      return;
    }

    const url = URL.createObjectURL(nextFile);
    objectUrlRef.current = url;
    setObjectUrl(url);
  }

  function openFilePicker() {
    inputRef.current?.click();
  }

  useEffect(() => {
    if (presentation !== "coverDropzone" || !isPasteTargetActive) return;

    function chooseWindowPastedImage(event: ClipboardEvent) {
      const pastedFile = Array.from(event.clipboardData?.files ?? []).find((item) => item.type.startsWith("image/"));
      if (!pastedFile) return;
      event.preventDefault();
      chooseFile(pastedFile);
    }

    window.addEventListener("paste", chooseWindowPastedImage);
    return () => window.removeEventListener("paste", chooseWindowPastedImage);
  }, [isPasteTargetActive, presentation]);

  useEffect(() => {
    if (!objectUrl) return;
    const stage = stageRef.current;
    if (!stage || !naturalSize.width || !naturalSize.height) return;

    function updateMediaBounds() {
      const currentStage = stageRef.current;
      if (!currentStage) return;
      const bounds = currentStage.getBoundingClientRect();
      const isSideways = rotation % 180 !== 0;
      const sourceWidth = isSideways ? naturalSize.height : naturalSize.width;
      const sourceHeight = isSideways ? naturalSize.width : naturalSize.height;
      const nextBounds = getContainedMediaBounds(bounds.width, bounds.height, sourceWidth / sourceHeight);
      setMediaBounds(nextBounds);
      setCropRect((current) =>
        isCustomRatio
          ? constrainCropRect(current)
          : fitCropToAspect(current, activeRatioValue, nextBounds.width / nextBounds.height)
      );
    }

    updateMediaBounds();
    const observer = new ResizeObserver(updateMediaBounds);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [activeRatioValue, isCustomRatio, naturalSize.height, naturalSize.width, objectUrl, rotation]);

  async function confirmCrop() {
    if (!file || !objectUrl) return;
    setIsUploading(true);
    const blob = await cropImage(objectUrl, {
      rotation,
      aspectRatio: activeRatioValue,
      cropRect,
      circle: shape === "circle"
    });
    const croppedFile = new File([blob], file.name.replace(/\.[^.]+$/, ".png"), { type: "image/png" });
    const formData = new FormData();
    formData.append("file", croppedFile);
    formData.append("folder", folder);

    const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const body = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;
    setIsUploading(false);

    if (!response.ok || !body?.url) {
      toast.error("图片上传失败", { description: body?.error ?? "Unknown error" });
      return;
    }

    onUploaded(body.url);
    chooseFile(null);
    toast.success("图片已更新");
  }

  function updateRatio(nextRatio: CropRatio) {
    setRatio(nextRatio);
    if (nextRatio === "custom") {
      setCropRect((current) => constrainCropRect(current));
      return;
    }
    setCropRect((current) => fitCropToAspect(current, ratioValues[nextRatio], mediaAspect));
  }

  function startCropDrag(event: React.PointerEvent<HTMLElement>, mode: CropDragMode) {
    event.preventDefault();
    event.stopPropagation();
    const currentBounds = mediaBounds;
    if (!currentBounds) return;
    const dragBounds: MediaBounds = { ...currentBounds };
    event.currentTarget.setPointerCapture(event.pointerId);
    const startX = event.clientX;
    const startY = event.clientY;
    const startRect = cropRect;
    const aspect = activeRatioValue;

    function updateCrop(moveEvent: PointerEvent) {
      moveEvent.preventDefault();
      const deltaX = ((moveEvent.clientX - startX) / dragBounds.width) * 100;
      const deltaY = ((moveEvent.clientY - startY) / dragBounds.height) * 100;

      if (mode === "move") {
        setCropRect({
          ...startRect,
          x: clamp(startRect.x + deltaX, 0, 100 - startRect.width),
          y: clamp(startRect.y + deltaY, 0, 100 - startRect.height)
        });
        return;
      }

      setCropRect(
        isCustomRatio
          ? resizeFreeCropRect(startRect, mode, deltaX, deltaY)
          : resizeCropRect(startRect, mode, deltaX, deltaY, aspect, mediaAspect)
      );
    }

    function stopCrop() {
      window.removeEventListener("pointermove", updateCrop);
      window.removeEventListener("pointerup", stopCrop);
      window.removeEventListener("pointercancel", stopCrop);
    }

    window.addEventListener("pointermove", updateCrop);
    window.addEventListener("pointerup", stopCrop);
    window.addEventListener("pointercancel", stopCrop);
  }

  return (
    <>
      <div className="grid gap-2">
        {label ? <p className="text-sm font-semibold">{label}</p> : null}
        {presentation === "coverDropzone" ? (
          <div
            role="button"
            tabIndex={0}
            onClick={openFilePicker}
            onMouseEnter={() => setIsPasteTargetActive(true)}
            onMouseLeave={() => setIsPasteTargetActive(false)}
            onFocus={() => setIsPasteTargetActive(true)}
            onBlur={() => setIsPasteTargetActive(false)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openFilePicker();
              }
            }}
            className={cn(
              "group relative grid min-h-44 cursor-pointer place-items-center overflow-hidden rounded-[28px] border border-dashed border-[#C7D2E4] bg-[#F8FAFC] text-center outline-none transition",
              "hover:border-[#1677FF]/60 hover:bg-[#F3F8FF] focus:border-[#1677FF] focus:ring-4 focus:ring-[#1677FF]/10",
              previewClassName
            )}
          >
            {value ? (
              <img src={value} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : null}
            <div
              className={cn(
                "absolute inset-3 rounded-[24px] border border-dashed border-[#BFD7F5] bg-white/88 transition",
                value ? "opacity-0 backdrop-blur-[2px] group-hover:opacity-100 group-focus:opacity-100" : "opacity-100"
              )}
            />
            <div
              className={cn(
                "relative z-10 grid justify-items-center gap-2 px-5 text-[#5B7896] transition",
                value ? "opacity-0 group-hover:opacity-100 group-focus:opacity-100" : "opacity-100"
              )}
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl border border-[#D8E9FF] bg-white text-[#1677FF] shadow-soft">
                <ImageUp className="h-6 w-6" />
              </span>
              <span className="text-sm font-semibold text-[#1E3A5F]">点击选择，或直接在此区域粘贴图片</span>
            </div>
          </div>
        ) : value ? (
          <img
            src={value}
            alt=""
            className={cn(
              "h-28 w-28 border border-white/15 object-cover shadow-soft",
              shape === "circle" ? "rounded-full" : "rounded-[18px]",
              previewClassName
            )}
          />
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
          />
          <label
            htmlFor={inputId}
            className={cn(
              "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/15 bg-black px-4 text-sm font-semibold text-white transition hover:bg-black/85",
              buttonIconOnly && "h-9 w-9 px-0",
              buttonClassName
            )}
            title={buttonText}
          >
            <ImageUp className="h-4 w-4" />
            {buttonIconOnly ? null : buttonText}
          </label>
          {onClear && value ? (
            <button type="button" onClick={onClear} className="text-sm font-medium text-[#7A8190] hover:text-red-500">
              清除
            </button>
          ) : null}
        </div>
      </div>

      {objectUrl && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/35 p-4 backdrop-blur-sm">
              <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[22px] bg-white text-[#111] shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#EEF2F7] px-5 py-4">
                  <h3 className="text-base font-bold">裁剪图片 / crop</h3>
                  <button type="button" onClick={() => chooseFile(null)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-[#F1F5F9]">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid gap-5 overflow-auto p-5">
                  <div className="relative overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-[#F8FAFC]">
                    <div ref={stageRef} className="relative mx-auto h-[42vh] min-h-72 max-h-[440px] w-full select-none touch-none">
                      <img
                        ref={imageRef}
                        src={objectUrl}
                        alt=""
                        className="absolute inset-0 h-full w-full touch-none object-contain"
                        style={{
                          transform: `rotate(${rotation}deg)`,
                          transformOrigin: "center"
                        }}
                        draggable={false}
                        onLoad={(event) => {
                          setNaturalSize({
                            width: event.currentTarget.naturalWidth,
                            height: event.currentTarget.naturalHeight
                          });
                        }}
                      />
                      <div className="absolute inset-0 bg-black/20" />
                      {mediaBounds ? (
                        <div
                          onPointerDown={(event) => startCropDrag(event, "move")}
                          className={cn(
                            "absolute touch-none cursor-move border-2 border-white shadow-[0_0_0_999px_rgba(0,0,0,0.24)]",
                            shape === "circle" ? "rounded-full" : "rounded-[18px]"
                          )}
                          style={{
                            left: mediaBounds.left + (cropRect.x / 100) * mediaBounds.width,
                            top: mediaBounds.top + (cropRect.y / 100) * mediaBounds.height,
                            width: `${(cropRect.width / 100) * mediaBounds.width}px`,
                            height: `${(cropRect.height / 100) * mediaBounds.height}px`
                          }}
                        >
                          {(["nw", "ne", "sw", "se"] as const).map((handle) => (
                            <button
                              key={handle}
                              type="button"
                              aria-label={`resize ${handle}`}
                              onPointerDown={(event) => startCropDrag(event, handle)}
                              className={cn(
                                "absolute h-6 w-6 touch-none rounded-full border-2 border-white bg-[#1677FF] shadow-soft",
                                handle === "nw" && "-left-3 -top-3 cursor-nwse-resize",
                                handle === "ne" && "-right-3 -top-3 cursor-nesw-resize",
                                handle === "sw" && "-bottom-3 -left-3 cursor-nesw-resize",
                                handle === "se" && "-bottom-3 -right-3 cursor-nwse-resize"
                              )}
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="grid gap-2">
                      <p className="text-sm font-semibold text-[#475569]">拖拽裁剪框 / drag crop box</p>
                      <p className="text-xs text-[#94A3B8]">拖动框移动位置，拖拽四角调整裁剪范围。</p>
                    </div>
                    <div className="grid gap-3">
                      {shape !== "circle" ? (
                        <div className="grid gap-2">
                          <p className="text-sm font-semibold text-[#475569]">比例/aspect</p>
                          <div className="flex flex-wrap gap-2">
                            {(["1:1", "4:3", "16:9", "3:4", "custom"] as CropRatio[]).map((item) => (
                              <button
                                key={item}
                                type="button"
                                onClick={() => updateRatio(item)}
                                className={cn(
                                  "rounded-full border px-3 py-1.5 text-sm font-medium transition",
                                  activeRatio === item ? "border-[#1677FF] bg-[#1677FF] text-white" : "border-[#E5E7EB] bg-white text-[#475569] hover:border-[#1677FF]/40"
                                )}
                              >
                                {item === "custom" ? "自定义" : item}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setRotation((current) => (current + 90) % 360);
                          setCropRect(fitCropToAspect({ x: 15, y: 15, width: 70, height: 70 }, activeRatioValue, mediaAspect));
                        }}
                        className="rounded-full"
                      >
                        <RotateCcw className="h-4 w-4" />
                        旋转/rotate
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-[#EEF2F7] px-5 py-4">
                  <Button type="button" variant="ghost" onClick={() => chooseFile(null)}>
                    取消
                  </Button>
                  <Button type="button" className="rounded-full bg-black text-white hover:bg-black/90" onClick={confirmCrop} disabled={isUploading}>
                    {isUploading ? "上传中" : "保存"}
                  </Button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}

async function cropImage(
  src: string,
  options: { rotation: number; aspectRatio: number; cropRect: CropRect; circle: boolean }
) {
  const image = await loadImage(src);
  const radians = (options.rotation * Math.PI) / 180;
  const rotatedCanvas = document.createElement("canvas");
  const isSideways = options.rotation % 180 !== 0;
  rotatedCanvas.width = isSideways ? image.naturalHeight : image.naturalWidth;
  rotatedCanvas.height = isSideways ? image.naturalWidth : image.naturalHeight;
  const rotatedContext = rotatedCanvas.getContext("2d");
  if (!rotatedContext) {
    throw new Error("Canvas is not available");
  }

  rotatedContext.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
  rotatedContext.rotate(radians);
  rotatedContext.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);

  const sx = (options.cropRect.x / 100) * rotatedCanvas.width;
  const sy = (options.cropRect.y / 100) * rotatedCanvas.height;
  const sourceWidth = (options.cropRect.width / 100) * rotatedCanvas.width;
  const sourceHeight = (options.cropRect.height / 100) * rotatedCanvas.height;
  const outputWidth = options.aspectRatio >= 1 ? 1200 : Math.round(1200 * options.aspectRatio);
  const outputHeight = options.aspectRatio >= 1 ? Math.round(1200 / options.aspectRatio) : 1200;
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is not available");
  }

  context.clearRect(0, 0, outputWidth, outputHeight);
  if (options.circle) {
    context.beginPath();
    context.arc(outputWidth / 2, outputHeight / 2, Math.min(outputWidth, outputHeight) / 2, 0, Math.PI * 2);
    context.clip();
  }

  context.drawImage(rotatedCanvas, sx, sy, sourceWidth, sourceHeight, 0, 0, outputWidth, outputHeight);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Failed to crop image"));
      }
    }, "image/png");
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getCropRectAspect(rect: CropRect, mediaAspect: number) {
  return Math.max(0.05, (rect.width / Math.max(1, rect.height)) * mediaAspect);
}

function getContainedMediaBounds(stageWidth: number, stageHeight: number, mediaAspect: number): MediaBounds {
  const stageAspect = stageWidth / stageHeight;
  if (stageAspect > mediaAspect) {
    const width = stageHeight * mediaAspect;
    return {
      left: (stageWidth - width) / 2,
      top: 0,
      width,
      height: stageHeight
    };
  }

  const height = stageWidth / mediaAspect;
  return {
    left: 0,
    top: (stageHeight - height) / 2,
    width: stageWidth,
    height
  };
}

function constrainCropRect(rect: CropRect): CropRect {
  const minSize = 18;
  const width = clamp(rect.width, minSize, 100);
  const height = clamp(rect.height, minSize, 100);
  return {
    width,
    height,
    x: clamp(rect.x, 0, 100 - width),
    y: clamp(rect.y, 0, 100 - height)
  };
}

function fitCropToAspect(rect: CropRect, aspect: number, mediaAspect: number): CropRect {
  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;
  let width = rect.width;
  let height = (width * mediaAspect) / aspect;

  if (height > 92) {
    height = 92;
    width = (height * aspect) / mediaAspect;
  }
  if (width > 92) {
    width = 92;
    height = (width * mediaAspect) / aspect;
  }

  return {
    width,
    height,
    x: clamp(centerX - width / 2, 0, 100 - width),
    y: clamp(centerY - height / 2, 0, 100 - height)
  };
}

function resizeFreeCropRect(rect: CropRect, mode: CropDragMode, deltaX: number, deltaY: number): CropRect {
  const minSize = 18;
  const anchorRight = rect.x + rect.width;
  const anchorBottom = rect.y + rect.height;
  const isLeft = mode === "nw" || mode === "sw";
  const isTop = mode === "nw" || mode === "ne";

  let x = rect.x;
  let y = rect.y;
  let width = rect.width;
  let height = rect.height;

  if (isLeft) {
    x = clamp(rect.x + deltaX, 0, anchorRight - minSize);
    width = anchorRight - x;
  } else {
    width = clamp(rect.width + deltaX, minSize, 100 - rect.x);
  }

  if (isTop) {
    y = clamp(rect.y + deltaY, 0, anchorBottom - minSize);
    height = anchorBottom - y;
  } else {
    height = clamp(rect.height + deltaY, minSize, 100 - rect.y);
  }

  return { x, y, width, height };
}

function resizeCropRect(rect: CropRect, mode: CropDragMode, deltaX: number, deltaY: number, aspect: number, mediaAspect: number): CropRect {
  const minWidth = 18;
  const anchorRight = rect.x + rect.width;
  const anchorBottom = rect.y + rect.height;
  const isLeft = mode === "nw" || mode === "sw";
  const isTop = mode === "nw" || mode === "ne";
  const horizontalWidth = isLeft ? rect.width - deltaX : rect.width + deltaX;
  const verticalWidth = ((isTop ? rect.height - deltaY : rect.height + deltaY) * aspect) / mediaAspect;
  let width = Math.max(minWidth, Math.max(horizontalWidth, verticalWidth));
  let height = (width * mediaAspect) / aspect;

  if (isLeft) width = Math.min(width, anchorRight);
  if (!isLeft) width = Math.min(width, 100 - rect.x);
  height = (width * mediaAspect) / aspect;
  if (isTop) height = Math.min(height, anchorBottom);
  if (!isTop) height = Math.min(height, 100 - rect.y);
  width = (height * aspect) / mediaAspect;

  return {
    width,
    height,
    x: isLeft ? anchorRight - width : rect.x,
    y: isTop ? anchorBottom - height : rect.y
  };
}
