"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Baseline,
  Bold,
  Italic,
  LinkIcon,
  Minus,
  Underline
} from "lucide-react";
import type { Block, BlockActionType } from "@/types/block";
import { blockActionTypes } from "@/constants/block-types";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { ImageCropUploader } from "@/components/admin/ImageCropUploader";
import { cn, isSectionTextBlock } from "@/lib/utils";

const iconPresets = ["link", "github", "twitter", "instagram", "youtube", "linkedin", "website", "activity", "map", "chef-hat"];
const actionTypeLabels: Record<BlockActionType, string> = {
  none: "无动作/none",
  link: "前往链接/link",
  "image-preview": "图片预览/image preview",
  modal: "弹窗/modal",
  copy: "复制内容/copy",
  download: "下载/download"
};

export function BlockForm({
  block,
  onPatch
}: {
  block: Block;
  onPatch: (patch: Partial<Block>) => void;
}) {
  const copyText = typeof block.metadata?.copyText === "string" ? block.metadata.copyText : "";
  const isSectionBlock = isSectionTextBlock(block);
  const isPlainTextBlock = block.metadata?.textVariant === "plain";

  function patchHref(value: string) {
    onPatch({ href: value, icon: inferIconFromUrl(value, block.icon) });
  }

  function patchMetadata(patch: Record<string, unknown>) {
    onPatch({ metadata: { ...(block.metadata ?? {}), ...patch } });
  }

  if (isPlainTextBlock) {
    return (
      <PlainTextBlockForm
        block={block}
        onPatch={onPatch}
        onPatchMetadata={patchMetadata}
        onPatchHref={(value) => onPatch({ href: value, actionType: value.trim() ? "link" : "none", icon: inferIconFromUrl(value, block.icon) })}
      />
    );
  }

  return (
    <div className="grid gap-5 text-[#333]">
      {!isSectionBlock ? (
        <ImageCropUploader
          folder="blocks"
          value={block.coverImage}
          label="封面"
          buttonText="更换图片"
          presentation="coverDropzone"
          onUploaded={(url) => onPatch({ coverImage: url })}
          onClear={() => onPatch({ coverImage: "" })}
        />
      ) : null}

      <div className="grid gap-3">
        <Field label="标题/title">
          <Input
            value={block.title}
            onChange={(event) => onPatch({ title: event.target.value })}
          />
        </Field>
        <Field label="副标题/subtitle">
          <Input
            value={block.subtitle ?? ""}
            onChange={(event) => onPatch({ subtitle: event.target.value })}
          />
        </Field>
        {!isSectionBlock ? <Field label="描述/description">
          <Textarea
            value={block.description ?? ""}
            onChange={(event) => onPatch({ description: event.target.value })}
            className="min-h-28"
          />
        </Field> : null}
        {!isSectionBlock ? <Field label="链接/link">
          <Input
            value={block.href ?? ""}
            onChange={(event) => patchHref(event.target.value)}
            placeholder="填入链接"
          />
        </Field> : null}

        {isSectionBlock ? (
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="标题对齐/title align">
              <Select
                value={getSectionMetadataValue(block.metadata?.titleAlign, ["left", "center", "right"], "left")}
                onChange={(event) => onPatch({ metadata: { ...(block.metadata ?? {}), titleAlign: event.target.value } })}
              >
                <option value="left">left</option>
                <option value="center">center</option>
                <option value="right">right</option>
              </Select>
            </Field>
            <Field label="标题大小/title size">
              <Select
                value={getSectionMetadataValue(block.metadata?.titleSize, ["sm", "md", "lg"], "md")}
                onChange={(event) => onPatch({ metadata: { ...(block.metadata ?? {}), titleSize: event.target.value } })}
              >
                <option value="sm">sm</option>
                <option value="md">md</option>
                <option value="lg">lg</option>
              </Select>
            </Field>
          </div>
        ) : (
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="动作/action">
            <Select
              value={block.actionType}
              onChange={(event) => onPatch({ actionType: event.target.value as BlockActionType })}
            >
              {blockActionTypes.map((action) => (
                <option key={action} value={action}>
                  {actionTypeLabels[action]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="角标/badge">
            <Input
              value={block.badge ?? ""}
              onChange={(event) => onPatch({ badge: event.target.value })}
            />
          </Field>
          {block.actionType === "copy" ? (
            <Field label="复制内容/copy text" className="md:col-span-2">
              <Input
                value={copyText}
                onChange={(event) => onPatch({ metadata: { ...(block.metadata ?? {}), copyText: event.target.value } })}
              />
            </Field>
          ) : null}
        </div>
        )}

        <div className="grid gap-1.5 text-sm font-medium text-[#333]">
          <span>图标/icon</span>
          <div className="flex flex-wrap gap-2 rounded-[18px] border border-[#EAEAEA] bg-[#FAFAFA] p-2">
            <button
              type="button"
              onClick={() => onPatch({ icon: "" })}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                !block.icon ? "border-[#1677FF] bg-[#1677FF] text-white" : "border-[#EAEAEA] bg-white text-[#475569] hover:border-[#1677FF]/40"
              }`}
            >
              不显示/none
            </button>
            {iconPresets.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => onPatch({ icon })}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  block.icon === icon ? "border-[#1677FF] bg-[#1677FF] text-white" : "border-[#EAEAEA] bg-white text-[#475569] hover:border-[#1677FF]/40"
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-[#475569]">
          <label className="flex items-center gap-2">
            <Checkbox checked={block.isVisible} onChange={(event) => onPatch({ isVisible: event.target.checked })} />
            显示/visible
          </label>
          <label className="flex items-center gap-2">
            <Checkbox checked={block.isFeatured} onChange={(event) => onPatch({ isFeatured: event.target.checked })} />
            精选/featured
          </label>
          <label className="flex items-center gap-2">
            <Checkbox checked={block.openInNewTab ?? true} onChange={(event) => onPatch({ openInNewTab: event.target.checked })} />
            新窗口/open tab
          </label>
        </div>
      </div>
    </div>
  );
}

function getSectionMetadataValue<T extends string>(value: unknown, values: readonly T[], fallback: T): T {
  return values.includes(value as T) ? (value as T) : fallback;
}

function PlainTextBlockForm({
  block,
  onPatch,
  onPatchMetadata,
  onPatchHref
}: {
  block: Block;
  onPatch: (patch: Partial<Block>) => void;
  onPatchMetadata: (patch: Record<string, unknown>) => void;
  onPatchHref: (value: string) => void;
}) {
  const textAlign = getMetadataValue(block.metadata?.textAlign, ["left", "center", "right"], "center");
  const verticalAlign = getMetadataValue(block.metadata?.verticalAlign, ["top", "center", "bottom"], "center");
  const textBold = block.metadata?.textBold === true;
  const textItalic = block.metadata?.textItalic === true;
  const textUnderline = block.metadata?.textUnderline === true;
  const textColor = block.textColor || "#111111";

  return (
    <div className="grid gap-6 text-[#333]">
      <Field label="描述 *">
        <Textarea
          value={block.description || block.title}
          onChange={(event) => onPatch({ title: event.target.value, description: event.target.value })}
          className={cn(
            "min-h-40 resize-y rounded-[18px] border-[#D9DEE8] bg-[#FAFBFD] px-5 py-8 text-lg font-semibold leading-8",
            textAlign === "left" && "text-left",
            textAlign === "center" && "text-center",
            textAlign === "right" && "text-right",
            textBold && "font-bold",
            textItalic && "italic",
            textUnderline && "underline"
          )}
          style={{ color: textColor }}
          placeholder="输入文本内容"
        />
      </Field>

      <section className="grid gap-3">
        <h4 className="text-base font-bold text-[#111]">文字样式</h4>
        <div className="flex flex-wrap gap-3">
          <ToggleButton active={textBold} title="加粗" onClick={() => onPatchMetadata({ textBold: !textBold })}>
            <Bold className="h-4 w-4" />
          </ToggleButton>
          <ToggleButton active={textItalic} title="斜体" onClick={() => onPatchMetadata({ textItalic: !textItalic })}>
            <Italic className="h-4 w-4" />
          </ToggleButton>
          <ToggleButton active={textUnderline} title="下划线" onClick={() => onPatchMetadata({ textUnderline: !textUnderline })}>
            <Underline className="h-4 w-4" />
          </ToggleButton>
          <ToggleButton active={textAlign === "left"} title="左对齐" onClick={() => onPatchMetadata({ textAlign: "left" })}>
            <AlignLeft className="h-4 w-4" />
          </ToggleButton>
          <ToggleButton active={textAlign === "center"} title="居中" onClick={() => onPatchMetadata({ textAlign: "center" })}>
            <AlignCenter className="h-4 w-4" />
          </ToggleButton>
          <ToggleButton active={textAlign === "right"} title="右对齐" onClick={() => onPatchMetadata({ textAlign: "right" })}>
            <AlignRight className="h-4 w-4" />
          </ToggleButton>
          <label className="flex h-12 items-center gap-2 rounded-[18px] border border-[#D9DEE8] bg-white px-4 text-sm font-semibold text-[#475569]">
            <span className="grid h-6 w-6 place-items-center rounded-full border border-[#CBD5E1]" style={{ backgroundColor: textColor }} />
            颜色
            <input
              type="color"
              value={textColor}
              onChange={(event) => onPatch({ textColor: event.target.value })}
              className="h-0 w-0 opacity-0"
              aria-label="文字颜色"
            />
          </label>
        </div>
      </section>

      <section className="grid gap-3">
        <h4 className="text-base font-bold text-[#111]">竖直方向</h4>
        <div className="flex flex-wrap gap-3">
          <ToggleButton active={verticalAlign === "top"} title="顶部对齐" onClick={() => onPatchMetadata({ verticalAlign: "top" })}>
            <Baseline className="h-4 w-4 -translate-y-1" />
          </ToggleButton>
          <ToggleButton active={verticalAlign === "center"} title="垂直居中" onClick={() => onPatchMetadata({ verticalAlign: "center" })}>
            <Minus className="h-4 w-4" />
          </ToggleButton>
          <ToggleButton active={verticalAlign === "bottom"} title="底部对齐" onClick={() => onPatchMetadata({ verticalAlign: "bottom" })}>
            <Baseline className="h-4 w-4 translate-y-1" />
          </ToggleButton>
        </div>
      </section>

      <Field label="链接">
        <div className="relative">
          <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <Input value={block.href ?? ""} onChange={(event) => onPatchHref(event.target.value)} placeholder="填入链接" className="pl-9" />
        </div>
      </Field>

      <div className="flex flex-wrap gap-4 text-sm text-[#475569]">
        <label className="flex items-center gap-2">
          <Checkbox checked={block.isVisible} onChange={(event) => onPatch({ isVisible: event.target.checked })} />
          显示/visible
        </label>
        <label className="flex items-center gap-2">
          <Checkbox checked={block.openInNewTab ?? true} onChange={(event) => onPatch({ openInNewTab: event.target.checked })} />
          新窗口/open tab
        </label>
      </div>
    </div>
  );
}

function ToggleButton({
  active,
  title,
  onClick,
  children
}: {
  active: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "grid h-12 w-12 place-items-center rounded-full border text-[#475569] transition",
        active ? "border-[#1479FF] bg-[#1479FF] text-white" : "border-[#D9DEE8] bg-white hover:border-[#1479FF]/40"
      )}
    >
      {children}
    </button>
  );
}

function getMetadataValue<T extends string>(value: unknown, values: readonly T[], fallback: T): T {
  return values.includes(value as T) ? (value as T) : fallback;
}

function inferIconFromUrl(value: string, currentIcon?: string) {
  if (!value || currentIcon === "") return currentIcon;
  const lowerValue = value.toLowerCase();
  if (lowerValue.includes("github.com")) return "github";
  if (lowerValue.includes("twitter.com") || lowerValue.includes("x.com")) return "twitter";
  if (lowerValue.includes("instagram.com")) return "instagram";
  if (lowerValue.includes("youtube.com") || lowerValue.includes("youtu.be")) return "youtube";
  if (lowerValue.includes("linkedin.com")) return "linkedin";
  return currentIcon || "link";
}
