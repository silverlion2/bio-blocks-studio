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
import { BlockIcon, blockIconPresets, getBlockIconColor } from "@/components/blocks/BlockIcon";
import { cn, isSectionTextBlock } from "@/lib/utils";
import { editorCopy, type EditorLanguage } from "@/components/admin/editor-i18n";

export function BlockForm({
  block,
  onPatch,
  editorLanguage
}: {
  block: Block;
  onPatch: (patch: Partial<Block>) => void;
  editorLanguage: EditorLanguage;
}) {
  const copy = editorCopy[editorLanguage];
  const actionTypeLabels: Record<BlockActionType, string> = {
    none: copy.noAction,
    link: copy.linkAction,
    "image-preview": copy.imagePreviewEnabled,
    modal: copy.modalAction,
    copy: copy.blockCopyText,
    download: copy.download
  };
  const copyText = typeof block.metadata?.copyText === "string" ? block.metadata.copyText : "";
  const isSectionBlock = isSectionTextBlock(block);
  const isPlainTextBlock = block.metadata?.textVariant === "plain";
  const iconColorValue = typeof block.metadata?.iconColor === "string" ? block.metadata.iconColor : "#1677FF";
  const iconPreviewColor = getBlockIconColor(iconColorValue);

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
        editorLanguage={editorLanguage}
      />
    );
  }

  return (
    <div className="grid gap-5 text-[#333]">
      {!isSectionBlock ? (
        <ImageCropUploader
          folder="blocks"
          value={block.coverImage}
          label={editorLanguage === "zh-CN" ? "封面" : "Cover"}
          buttonText={editorLanguage === "zh-CN" ? "更换图片" : "Change Image"}
          presentation="coverDropzone"
          previewClassName="h-44 w-44 max-w-full"
          onUploaded={(url) => onPatch({ coverImage: url })}
          onClear={() => onPatch({ coverImage: "" })}
        />
      ) : null}

      <div className="grid gap-3">
        <Field label={copy.blockTitle}>
          <Input
            value={block.title}
            onChange={(event) => onPatch({ title: event.target.value })}
            placeholder={editorLanguage === "zh-CN" ? "例如：作品集项目" : "Example: Featured Project"}
          />
        </Field>
        <Field label={copy.blockSubtitle}>
          <Input
            value={block.subtitle ?? ""}
            onChange={(event) => onPatch({ subtitle: event.target.value })}
            placeholder={editorLanguage === "zh-CN" ? "可选；留空时，悬停不会展示副标题" : "Optional; leave empty to hide subtitle on hover"}
          />
        </Field>
        {!isSectionBlock ? <Field label={copy.blockDescription}>
          <Textarea
            value={block.description ?? ""}
            onChange={(event) => onPatch({ description: event.target.value })}
            placeholder={editorLanguage === "zh-CN" ? "可选；留空时，悬停不会展示描述" : "Optional; leave empty to hide description on hover"}
            className="min-h-28"
          />
        </Field> : null}
        {!isSectionBlock ? <Field label={copy.blockHref}>
          <Input
            value={block.href ?? ""}
            onChange={(event) => patchHref(event.target.value)}
            placeholder="https://example.com"
          />
        </Field> : null}

        {isSectionBlock ? (
          <div className="grid gap-3 md:grid-cols-2">
            <Field label={editorLanguage === "zh-CN" ? "标题对齐" : "Title Alignment"}>
              <Select
                value={getSectionMetadataValue(block.metadata?.titleAlign, ["left", "center", "right"], "left")}
                onChange={(event) => onPatch({ metadata: { ...(block.metadata ?? {}), titleAlign: event.target.value } })}
              >
                <option value="left">left</option>
                <option value="center">center</option>
                <option value="right">right</option>
              </Select>
            </Field>
            <Field label={editorLanguage === "zh-CN" ? "标题大小" : "Title Size"}>
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
          <Field label={copy.blockAction}>
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
          <Field label={copy.blockBadge}>
            <Input
              value={block.badge ?? ""}
              onChange={(event) => onPatch({ badge: event.target.value })}
              placeholder={editorLanguage === "zh-CN" ? "例如：精选" : "Example: Featured"}
            />
          </Field>
          <Field label={editorLanguage === "zh-CN" ? "左上角图标" : "Top-left Icon"} className="md:col-span-2">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                aria-pressed={!block.icon}
                onClick={() => onPatch({ icon: "" })}
                className={cn(
                  "inline-grid min-h-10 grid-cols-[16px_auto] items-center gap-1.5 rounded-full border px-3 text-sm transition",
                  !block.icon ? "border-[#1479FF] bg-[#1479FF] text-white" : "border-[#EAEAEA] bg-white text-[#475569] hover:border-[#1479FF]/40"
                )}
              >
                <Minus className="h-4 w-4" />
                <span>{editorLanguage === "zh-CN" ? "不显示" : "None"}</span>
              </button>
              {blockIconPresets.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  aria-pressed={block.icon === icon}
                  onClick={() => onPatch({ icon })}
                  className={cn(
                    "inline-grid min-h-10 grid-cols-[16px_auto] items-center gap-1.5 rounded-full border px-3 text-sm transition",
                    block.icon === icon ? "border-[#1479FF] bg-[#1479FF] text-white" : "border-[#EAEAEA] bg-white text-[#475569] hover:border-[#1479FF]/40"
                  )}
                >
                  <BlockIcon name={icon} className="h-4 w-4" style={{ color: block.icon === icon ? undefined : iconPreviewColor }} />
                  <span>{getBlockIconLabel(icon, editorLanguage)}</span>
                </button>
              ))}
            </div>
            {block.icon ? (
              <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl border border-[#E6EDF7] bg-[#F8FAFD] px-3 py-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-white bg-white shadow-sm">
                  <BlockIcon name={block.icon} className="h-5 w-5" style={{ color: iconPreviewColor }} />
                </span>
                <label className="relative grid h-10 w-10 cursor-pointer place-items-center overflow-hidden rounded-xl border border-[#D9E2F0] bg-white shadow-sm">
                  <span className="h-6 w-6 rounded-lg border border-black/10" style={{ backgroundColor: iconPreviewColor }} />
                  <input
                    type="color"
                    value={iconPreviewColor}
                    onChange={(event) => patchMetadata({ iconColor: event.target.value.toUpperCase() })}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    aria-label={editorLanguage === "zh-CN" ? "图标颜色" : "Icon color"}
                  />
                </label>
                <Input
                  value={iconColorValue}
                  onChange={(event) => patchMetadata({ iconColor: event.target.value })}
                  placeholder="#1677FF"
                  maxLength={7}
                  spellCheck={false}
                  className="w-32 font-mono uppercase"
                  aria-label={editorLanguage === "zh-CN" ? "图标颜色 HEX" : "Icon color HEX"}
                />
                <span className="text-xs font-medium text-[#64748B]">{editorLanguage === "zh-CN" ? "图标颜色（HEX）" : "Icon color (HEX)"}</span>
              </div>
            ) : null}
          </Field>
          {block.actionType === "copy" ? (
            <Field label={copy.blockCopyText} className="md:col-span-2">
              <Input
                value={copyText}
                onChange={(event) => onPatch({ metadata: { ...(block.metadata ?? {}), copyText: event.target.value } })}
              />
            </Field>
          ) : null}
        </div>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-[#475569]">
          <label className="flex items-center gap-2">
            <Checkbox checked={block.isVisible} onChange={(event) => onPatch({ isVisible: event.target.checked })} />
            {copy.visible}
          </label>
          <label className="flex items-center gap-2">
            <Checkbox checked={block.isFeatured} onChange={(event) => onPatch({ isFeatured: event.target.checked })} />
            {copy.featured}
          </label>
          <label className="flex items-center gap-2">
            <Checkbox checked={block.openInNewTab ?? true} onChange={(event) => onPatch({ openInNewTab: event.target.checked })} />
            {copy.openTab}
          </label>
        </div>
      </div>
    </div>
  );
}

function getSectionMetadataValue<T extends string>(value: unknown, values: readonly T[], fallback: T): T {
  return values.includes(value as T) ? (value as T) : fallback;
}

function getBlockIconLabel(icon: string, editorLanguage: EditorLanguage) {
  const labels: Record<string, [string, string]> = {
    build: ["区块", "Blocks"],
    briefcase: ["工作", "Work"],
    "chef-hat": ["创作", "Create"],
    "book-open": ["阅读", "Read"],
    award: ["奖项", "Award"],
    map: ["地点", "Map"],
    sparkle: ["高光", "Highlight"],
    link: ["链接", "Link"],
    github: ["GitHub", "GitHub"],
    x: ["X", "X"],
    instagram: ["Instagram", "Instagram"],
    youtube: ["YouTube", "YouTube"],
    linkedin: ["LinkedIn", "LinkedIn"],
    website: ["网站", "Website"],
    mail: ["邮箱", "Email"]
  };
  return labels[icon]?.[editorLanguage === "zh-CN" ? 0 : 1] ?? icon;
}

function PlainTextBlockForm({
  block,
  onPatch,
  onPatchMetadata,
  onPatchHref,
  editorLanguage
}: {
  block: Block;
  onPatch: (patch: Partial<Block>) => void;
  onPatchMetadata: (patch: Record<string, unknown>) => void;
  onPatchHref: (value: string) => void;
  editorLanguage: EditorLanguage;
}) {
  const copy = editorCopy[editorLanguage];
  const textAlign = getMetadataValue(block.metadata?.textAlign, ["left", "center", "right"], "center");
  const verticalAlign = getMetadataValue(block.metadata?.verticalAlign, ["top", "center", "bottom"], "center");
  const textBold = block.metadata?.textBold === true;
  const textItalic = block.metadata?.textItalic === true;
  const textUnderline = block.metadata?.textUnderline === true;
  const textColor = block.textColor || "#111111";

  return (
    <div className="grid gap-6 text-[#333]">
      <Field label={`${copy.textContent} *`}>
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
          placeholder={copy.textContentPlaceholder}
        />
      </Field>

      <section className="grid gap-3">
        <h4 className="text-base font-bold text-[#111]">{copy.textStyle}</h4>
        <div className="flex flex-wrap gap-3">
          <ToggleButton active={textBold} title={copy.textBold} onClick={() => onPatchMetadata({ textBold: !textBold })}>
            <Bold className="h-4 w-4" />
          </ToggleButton>
          <ToggleButton active={textItalic} title={copy.textItalic} onClick={() => onPatchMetadata({ textItalic: !textItalic })}>
            <Italic className="h-4 w-4" />
          </ToggleButton>
          <ToggleButton active={textUnderline} title={copy.textUnderline} onClick={() => onPatchMetadata({ textUnderline: !textUnderline })}>
            <Underline className="h-4 w-4" />
          </ToggleButton>
          <ToggleButton active={textAlign === "left"} title={copy.textAlignLeft} onClick={() => onPatchMetadata({ textAlign: "left" })}>
            <AlignLeft className="h-4 w-4" />
          </ToggleButton>
          <ToggleButton active={textAlign === "center"} title={copy.textAlignCenter} onClick={() => onPatchMetadata({ textAlign: "center" })}>
            <AlignCenter className="h-4 w-4" />
          </ToggleButton>
          <ToggleButton active={textAlign === "right"} title={copy.textAlignRight} onClick={() => onPatchMetadata({ textAlign: "right" })}>
            <AlignRight className="h-4 w-4" />
          </ToggleButton>
          <label className="flex h-12 items-center gap-2 rounded-[18px] border border-[#D9DEE8] bg-white px-4 text-sm font-semibold text-[#475569]">
            <span className="grid h-6 w-6 place-items-center rounded-full border border-[#CBD5E1]" style={{ backgroundColor: textColor }} />
            {copy.color}
            <input
              type="color"
              value={textColor}
              onChange={(event) => onPatch({ textColor: event.target.value })}
              className="h-0 w-0 opacity-0"
              aria-label={copy.color}
            />
          </label>
        </div>
      </section>

      <section className="grid gap-3">
        <h4 className="text-base font-bold text-[#111]">{copy.verticalAlign}</h4>
        <div className="flex flex-wrap gap-3">
          <ToggleButton active={verticalAlign === "top"} title={copy.verticalTop} onClick={() => onPatchMetadata({ verticalAlign: "top" })}>
            <Baseline className="h-4 w-4 -translate-y-1" />
          </ToggleButton>
          <ToggleButton active={verticalAlign === "center"} title={copy.verticalCenter} onClick={() => onPatchMetadata({ verticalAlign: "center" })}>
            <Minus className="h-4 w-4" />
          </ToggleButton>
          <ToggleButton active={verticalAlign === "bottom"} title={copy.verticalBottom} onClick={() => onPatchMetadata({ verticalAlign: "bottom" })}>
            <Baseline className="h-4 w-4 translate-y-1" />
          </ToggleButton>
        </div>
      </section>

      <Field label={copy.blockHref}>
        <div className="relative">
          <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <Input value={block.href ?? ""} onChange={(event) => onPatchHref(event.target.value)} placeholder={editorLanguage === "zh-CN" ? "填入链接" : "Enter link"} className="pl-9" />
        </div>
      </Field>

      <div className="flex flex-wrap gap-4 text-sm text-[#475569]">
        <label className="flex items-center gap-2">
          <Checkbox checked={block.isVisible} onChange={(event) => onPatch({ isVisible: event.target.checked })} />
          {copy.visible}
        </label>
        <label className="flex items-center gap-2">
          <Checkbox checked={block.openInNewTab ?? true} onChange={(event) => onPatch({ openInNewTab: event.target.checked })} />
          {copy.openTab}
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
  if (lowerValue.includes("twitter.com") || lowerValue.includes("x.com")) return "x";
  if (lowerValue.includes("instagram.com")) return "instagram";
  if (lowerValue.includes("youtube.com") || lowerValue.includes("youtu.be")) return "youtube";
  if (lowerValue.includes("linkedin.com")) return "linkedin";
  return currentIcon || "link";
}
