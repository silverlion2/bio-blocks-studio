"use client";

import {
  closestCenter,
  type CollisionDetection,
  DragOverlay,
  DndContext,
  MouseSensor,
  TouchSensor,
  type DragEndEvent,
  type DragMoveEvent,
  type DragOverEvent,
  type DragStartEvent,
  useDroppable,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlignLeft,
  AppWindow,
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  Copy,
  Download,
  FileText,
  Globe2,
  Github,
  GripVertical,
  ImagePlus,
  Instagram,
  LinkIcon,
  Linkedin,
  Laptop,
  Mail,
  MapPin,
  Palette,
  Pencil,
  Plus,
  RectangleHorizontal,
  RectangleVertical,
  Save,
  Settings,
  Smartphone,
  Square,
  Trash2,
  Twitter,
  Type,
  Upload,
  X,
  Youtube
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { toast } from "sonner";
import type { Block, BlockSize, BlockType, LayoutDevice } from "@/types/block";
import type { Profile, SocialLink } from "@/types/profile";
import type { Section } from "@/types/section";
import type { SiteConfig } from "@/types/site-config";
import { validateSiteConfig } from "@/lib/validators";
import {
  bySortOrder,
  buildRenderModel,
  getNextContentSortOrder,
  isSectionTextBlock,
  normalizeContentFlowConfig,
  normalizeSortOrder,
  cn,
  topLevelBlockSectionId
} from "@/lib/utils";
import {
  blockGridClassByDevice,
  blockSizeClassByDevice,
  getCompactedBlockGridStyles,
  getAdminBlockGridStyle,
  getBlockColumnStart,
  getBlockRowStart,
  getBlockSize,
  getDefaultGridSpan,
  getDefaultRowSpan,
  getLogicalColumnCount,
  getLogicalColumnSpan
} from "@/constants/block-layout";
import { BlockCard } from "@/components/blocks/BlockCard";
import { BlockForm } from "@/components/admin/BlockForm";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { ImageCropUploader } from "@/components/admin/ImageCropUploader";

type ModalState =
  | { type: "tags" }
  | { type: "social" }
  | { type: "block"; blockId: string }
  | { type: "add-block" }
  | { type: "project-settings" }
  | null;

const blockTemplates: {
  group: string;
  items: { label: string; description: string; type: BlockType; size: BlockSize; icon: React.ReactNode }[];
}[] = [
  {
    group: "作品",
    items: [
      { label: "文本区块", description: "整行标题/说明", type: "section", size: "section-text", icon: <AlignLeft /> },
      { label: "导入", description: "外部链接", type: "link", size: "small-square", icon: <LinkIcon /> },
      { label: "标题", description: "标题卡片", type: "text", size: "wide", icon: <Type /> },
      { label: "文字", description: "文章摘要", type: "text", size: "wide", icon: <FileText /> },
      { label: "图片", description: "上传图片", type: "image", size: "wide", icon: <ImagePlus /> },
      { label: "App", description: "应用项目", type: "project", size: "large-square", icon: <AppWindow /> },
      { label: "公众号", description: "社交账号", type: "social", size: "small-square", icon: <BookOpen /> }
    ]
  },
  {
    group: "经历",
    items: [
      { label: "高光时刻", description: "状态/动态", type: "status", size: "wide", icon: <Palette /> },
      { label: "教育经历", description: "教育卡片", type: "text", size: "large-square", icon: <BookOpen /> },
      { label: "工作经历", description: "经历卡片", type: "project", size: "large-square", icon: <BriefcaseBusiness /> }
    ]
  },
  {
    group: "社交媒体",
    items: [
      { label: "GitHub", description: "GitHub 链接", type: "social", size: "small-square", icon: <Github /> },
      { label: "X", description: "X / Twitter", type: "social", size: "small-square", icon: <X /> }
    ]
  }
];

const blockSizePresets: { size: BlockSize; label: string; icon: React.ReactNode }[] = [
  { size: "small-square", label: "小方块", icon: <Square /> },
  { size: "wide", label: "横向 2 格", icon: <RectangleHorizontal /> },
  { size: "large-square", label: "大方块 2x2", icon: <Square className="scale-125" /> },
  { size: "full-wide", label: "整行", icon: <RectangleHorizontal className="scale-125" /> },
  { size: "tall", label: "竖向", icon: <RectangleVertical /> }
];

const editorCanvasWidth: Record<LayoutDevice, number> = {
  desktop: 1180,
  mobile: 430
};

const desktopBreakpoint = 768;
type ResizeMetrics = {
  left: number;
  top: number;
  columnWidth: number;
  gap: number;
  columns: number;
  minSpan: number;
  cellSize: number;
};

type BlockResizeDraft = {
  size: BlockSize;
  gridSpan: number;
  rowSpan: number;
};

type DragOverlayRect = {
  width: number;
  height: number;
};

type DragPreviewPlacement = {
  blockId: string;
  targetSectionId: string;
  targetIndex: number;
  targetContentIndex?: number;
  columnStart?: number;
  rowStart?: number;
};

type BlockPlacementDraft = {
  columnStart?: number;
  rowStart?: number;
};

const blockDropPreviewId = "__block_drop_preview__";
let adminDragBlockRectsSnapshot = new Map<string, MeasuredRect>();

type RectLike = Pick<DOMRectReadOnly, "left" | "top" | "width" | "height">;
type MeasuredRect = RectLike & Pick<DOMRectReadOnly, "right" | "bottom">;
type Point = {
  x: number;
  y: number;
};

type GridMetrics = {
  rect: DOMRectReadOnly;
  columns: number;
  columnWidth: number;
  rowHeight: number;
  columnGap: number;
  rowGap: number;
};

type GridPlacement = {
  column: number;
  row: number;
  columnSpan: number;
  rowSpan: number;
};

type ContentFlowItem =
  | { type: "text-block"; id: string; block: Block }
  | { type: "top-level-block"; id: string; block: Block };

type EditorContentItem =
  | { id: string; type: "top-level-blocks"; blocks: Block[]; sortOrder: number }
  | { id: string; type: "text-block"; block: Block; sortOrder: number };

export function AdminVisualEditor({ initialConfig }: { initialConfig: SiteConfig }) {
  const [config, setConfig] = useState(() => normalizeContentFlowConfig(initialConfig));
  const [modal, setModal] = useState<ModalState>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [resizePreviewSize, setResizePreviewSize] = useState<BlockSize | null>(null);
  const [resizeDrafts, setResizeDrafts] = useState<Record<string, BlockResizeDraft>>({});
  const [activeDragBlockId, setActiveDragBlockId] = useState<string | null>(null);
  const [dragOverlayRect, setDragOverlayRect] = useState<DragOverlayRect | null>(null);
  const [dragPreviewPlacement, setDragPreviewPlacement] = useState<DragPreviewPlacement | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [editorDevice, setEditorDevice] = useState<LayoutDevice>(() => {
    if (typeof window === "undefined") return "desktop";
    return window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop";
  });
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  const dragStartPointerRef = useRef<Point | null>(null);
  const dragPointerRef = useRef<Point | null>(null);
  const dragPointerOffsetRef = useRef<Point | null>(null);
  const dragPointerUpdatedAtRef = useRef(0);
  const dragPointerSourceRef = useRef<"native" | "synthetic" | null>(null);
  const dragOverlayRectRef = useRef<DragOverlayRect | null>(null);
  const activeDragBlockIdRef = useRef<string | null>(null);
  const dragPreviewPlacementRef = useRef<DragPreviewPlacement | null>(null);
  const dragPreviewSyncFrameRef = useRef<number | null>(null);
  const configRef = useRef(config);
  const editorDeviceRef = useRef(editorDevice);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 320, tolerance: 10 } })
  );
  const validation = useMemo(() => validateSiteConfig(config), [config]);
  const renderModel = useMemo(() => buildRenderModel(config), [config]);
  const blockSectionById = useMemo(() => {
    return new Map(config.blocks.map((block) => [block.id, block.sectionId]));
  }, [config.blocks]);
  const collisionDetection = useMemo<CollisionDetection>(() => {
    return (args) => {
      const activeId = String(args.active.id);
      const activeBlockSectionId = blockSectionById.get(activeId);

      if (!activeBlockSectionId) {
        return closestCenter(args);
      }

      return closestCenter({
        ...args,
        droppableContainers: args.droppableContainers.filter((container) => {
          const id = String(container.id);
          if (id === `section:${activeBlockSectionId}`) return false;
          return true;
        })
      });
    };
  }, [blockSectionById]);
  const hostDevice: LayoutDevice = viewportWidth !== null && viewportWidth < desktopBreakpoint ? "mobile" : "desktop";
  const canEditDesktop = hostDevice === "desktop";
  const canvasWidth = editorCanvasWidth[editorDevice];
  const canvasScale = viewportWidth === null ? 1 : Math.min(1, Math.max(0.32, (viewportWidth - 24) / canvasWidth));
  const activeDragBlock = useMemo(
    () => (activeDragBlockId ? config.blocks.find((block) => block.id === activeDragBlockId) ?? null : null),
    [activeDragBlockId, config.blocks]
  );
  const editorContentItems = useMemo(
    () => renderModel.orderedContentItems,
    [renderModel]
  );
  const activeTextPreviewContentIndex =
    activeDragBlock && isSectionTextBlock(activeDragBlock) && dragPreviewPlacement?.blockId === activeDragBlock.id
      ? dragPreviewPlacement.targetContentIndex
      : undefined;
  const topLevelSection = useMemo<Section>(
    () => ({
      id: topLevelBlockSectionId,
      title: "",
      emoji: "",
      description: "",
      titleAlign: "left",
      titleSize: "md",
      layout: "grid",
      gap: "md",
      sortOrder: 0,
      isVisible: true,
      createdAt: "",
      updatedAt: ""
    }),
    []
  );

  useEffect(() => {
    const updateViewport = () => {
      setViewportWidth(window.innerWidth);
      if (window.innerWidth < desktopBreakpoint) {
        setResizeDrafts({});
        setResizePreviewSize(null);
        setEditorDevice("mobile");
      }
    };
    const frame = window.requestAnimationFrame(() => {
      updateViewport();
      setHasMounted(true);
    });
    window.addEventListener("resize", updateViewport);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    editorDeviceRef.current = editorDevice;
  }, [editorDevice]);

  function getCurrentDragRect(): MeasuredRect | null {
    const pointer = dragPointerRef.current;
    const offset = dragPointerOffsetRef.current;
    const rect = dragOverlayRectRef.current;
    if (!pointer || !offset || !rect) return null;

    const left = pointer.x - offset.x;
    const top = pointer.y - offset.y;
    return {
      left,
      top,
      width: rect.width,
      height: rect.height,
      right: left + rect.width,
      bottom: top + rect.height
    };
  }

  function updateDragPreviewPlacement(next: DragPreviewPlacement | null) {
    const current = dragPreviewPlacementRef.current;
    if (
      current?.blockId === next?.blockId &&
      current?.targetSectionId === next?.targetSectionId &&
      current?.targetIndex === next?.targetIndex &&
      current?.targetContentIndex === next?.targetContentIndex &&
      current?.columnStart === next?.columnStart &&
      current?.rowStart === next?.rowStart
    ) {
      return;
    }
    cancelAdminBlockLayoutAnimations();
    dragPreviewPlacementRef.current = next;
    setDragPreviewPlacement(next);
    window.requestAnimationFrame(cancelAdminBlockLayoutAnimations);
  }

  function update(next: SiteConfig) {
    setConfig(normalizeContentFlowConfig(next));
    setIsDirty(true);
  }

  function exportConfig() {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = (config.settings.projectName || "site-config").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    link.href = url;
    link.download = `${safeName || "site-config"}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function importConfig(file: File) {
    const text = await file.text();
    const parsed = JSON.parse(text) as unknown;
    const result = validateSiteConfig(parsed);

    if (!result.success) {
      toast.error("导入失败", { description: result.error });
      return;
    }

    update(result.data);
    toast.success("配置已导入", { description: "检查无误后点击保存才会覆盖线上配置。" });
  }

  function patchProfile(patch: Partial<Profile>) {
    update({ ...config, profile: { ...config.profile, ...patch } });
  }

  function patchBlock(blockId: string, patch: Partial<Block>) {
    update({
      ...config,
      blocks: normalizeBlocks(
        config.blocks.map((block) =>
          block.id === blockId ? { ...block, ...patch, sectionId: topLevelBlockSectionId, updatedAt: new Date().toISOString() } : block
        )
      )
    });
  }

  function patchBlockSizeForDevice(blockId: string, size: BlockSize) {
    setConfig((current) =>
      normalizeContentFlowConfig({
        ...current,
        blocks: normalizeBlocks(
          current.blocks.map((block) =>
            block.id === blockId && !isSectionTextBlock(block)
              ? {
                  ...block,
                  sectionId: topLevelBlockSectionId,
                  size: block.size,
                  responsiveSizes: {
                    ...block.responsiveSizes,
                    [editorDevice]: size
                  },
                  updatedAt: new Date().toISOString()
                }
              : block
          )
        )
      })
    );
    setIsDirty(true);
  }

  function applyBlockPlacement(
    block: Block,
    device: LayoutDevice,
    placement?: BlockPlacementDraft
  ): Block {
    if (!placement?.columnStart && !placement?.rowStart) return block;
    return {
      ...block,
      placements: {
        ...block.placements,
        [device]: {
          ...block.placements?.[device],
          ...placement
        }
      },
      updatedAt: new Date().toISOString()
    };
  }

  function moveBlockWithPlacement(
    blockId: string,
    _targetSectionId: string,
    _targetIndex: number,
    placement?: BlockPlacementDraft
  ) {
    const activeBlock = config.blocks.find((block) => block.id === blockId);
    if (!activeBlock) return config.blocks;

    return normalizeBlocks(config.blocks).map((block) =>
      block.id === blockId
        ? applyBlockPlacement({ ...block, sectionId: topLevelBlockSectionId, updatedAt: new Date().toISOString() }, editorDevice, placement)
        : block
    );
  }

  function moveBlockToContentIndex(
    blockId: string,
    targetContentIndex: number,
    placement?: BlockPlacementDraft
  ): SiteConfig {
    const activeBlock = config.blocks.find((block) => block.id === blockId);
    if (!activeBlock) return config;

    const now = new Date().toISOString();
    const flowItems = getContentFlowForBlockMove(buildRenderModel(config), blockId);
    const nextItems: ContentFlowItem[] = [...flowItems];
    nextItems.splice(Math.max(0, Math.min(targetContentIndex, flowItems.length)), 0, {
      type: "top-level-block",
      id: blockId,
      block: activeBlock
    });

    const blockSortOrderById = new Map<string, number>();
    nextItems.forEach((item, index) => {
      blockSortOrderById.set(item.id, index + 1);
    });

    return {
      ...config,
      sections: [],
      blocks: normalizeBlocks(
        config.blocks.map((block) => {
          if (block.id === blockId) {
            return applyBlockPlacement(
              {
                ...block,
                sectionId: topLevelBlockSectionId,
                sortOrder: blockSortOrderById.get(block.id) ?? block.sortOrder,
                updatedAt: now
              },
              editorDevice,
              placement
            );
          }

          if (blockSortOrderById.has(block.id)) {
            return {
              ...block,
              sectionId: topLevelBlockSectionId,
              sortOrder: blockSortOrderById.get(block.id) ?? block.sortOrder
            };
          }

          return block;
        })
      ),
      settings: {
        ...config.settings,
        topLevelBlocksSortOrder: undefined
      }
    };
  }

  function deleteBlock(blockId: string) {
    if (!window.confirm("删除这个 Block？")) return;
    update({ ...config, blocks: normalizeBlocks(config.blocks.filter((block) => block.id !== blockId)) });
    setModal(null);
  }

  function addBlock(template: (typeof blockTemplates)[number]["items"][number]) {
    const now = new Date().toISOString();
    const isTextSection = template.type === "section";
    const newBlock: Block = {
      id: crypto.randomUUID(),
      sectionId: topLevelBlockSectionId,
      title: isTextSection ? "New Section" : template.label === "导入" ? "New Link" : template.label,
      subtitle: template.description,
      description: "",
      type: template.type,
      size: isTextSection ? "section-text" : template.size,
      responsiveSizes: isTextSection
        ? {
            desktop: "section-text",
            mobile: "section-text"
          }
        : undefined,
      coverImage: "",
      icon: template.type === "social" ? template.label.toLowerCase() : "",
      badge: "",
      href: "",
      actionType: template.type === "image" ? "image-preview" : "none",
      openInNewTab: true,
      backgroundColor: "",
      textColor: "",
      metadata: isTextSection
        ? {
            titleAlign: "left",
            titleSize: "md"
          }
        : {},
      isVisible: true,
      isFeatured: false,
      sortOrder: getNextContentSortOrder(config),
      createdAt: now,
      updatedAt: now
    };
    update({ ...config, blocks: [...config.blocks, newBlock] });
    setModal({ type: "block", blockId: newBlock.id });
  }

  function addSection() {
    const now = new Date().toISOString();
    const block: Block = {
      id: crypto.randomUUID(),
      sectionId: topLevelBlockSectionId,
      title: "New Section",
      subtitle: "",
      description: "",
      type: "section",
      size: "section-text",
      responsiveSizes: {
        desktop: "section-text",
        mobile: "section-text"
      },
      coverImage: "",
      icon: "",
      badge: "",
      href: "",
      actionType: "none",
      openInNewTab: false,
      backgroundColor: "",
      textColor: "",
      metadata: {
        titleAlign: "left",
        titleSize: "md"
      },
      sortOrder: getNextContentSortOrder(config),
      isVisible: true,
      isFeatured: false,
      createdAt: now,
      updatedAt: now
    };
    update({ ...config, blocks: [...config.blocks, block] });
    setModal({ type: "block", blockId: block.id });
  }

  function onDragStart(event: DragStartEvent) {
    const activeId = String(event.active.id);
    const activeBlock = config.blocks.find((block) => block.id === activeId);
    captureAdminBlockRects();
    const activeRect = getAdminBlockVisualRect(activeId) ?? event.active.rect.current.initial;
    const startPointer = getClientPoint(event.activatorEvent);
    const overlayRect = activeBlock && activeRect ? getDragOverlayRect(activeBlock, activeRect, editorDevice) : null;
    dragStartPointerRef.current = startPointer;
    dragPointerRef.current = startPointer;
    dragPointerOffsetRef.current =
      startPointer && activeRect ? { x: startPointer.x - activeRect.left, y: startPointer.y - activeRect.top } : null;
    dragPointerUpdatedAtRef.current = startPointer ? getNow() : 0;
    dragPointerSourceRef.current = startPointer ? "native" : null;
    dragOverlayRectRef.current = overlayRect;
    activeDragBlockIdRef.current = activeBlock?.id ?? null;
    window.addEventListener("pointermove", updateDragPointerFromPointerEvent);
    window.addEventListener("touchmove", updateDragPointerFromTouchEvent, { passive: true });
    setActiveDragBlockId(activeBlock?.id ?? null);
    setDragOverlayRect(overlayRect);
    updateDragPreviewPlacement(null);
  }

  function onDragMove(event: DragMoveEvent) {
    const activeId = String(event.active.id);
    const startPointer = dragStartPointerRef.current;
    if (startPointer) {
      const fallbackPointer = {
        x: startPointer.x + event.delta.x,
        y: startPointer.y + event.delta.y
      };
      const hasFreshNativePointer =
        dragPointerSourceRef.current === "native" && getNow() - dragPointerUpdatedAtRef.current < 80;

      if (!dragPointerRef.current || !hasFreshNativePointer) {
        dragPointerRef.current = fallbackPointer;
        dragPointerUpdatedAtRef.current = getNow();
        dragPointerSourceRef.current = "synthetic";
      }
    }

    const activeBlock = config.blocks.find((block) => block.id === activeId);
    if (!activeBlock) return;

    updateBlockDragPreview(activeBlock);
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    const activeBlock = config.blocks.find((block) => block.id === activeId);
    if (!activeBlock) return;

    const overBlock = config.blocks.find((block) => block.id === overId);
    if (!overBlock && !isSectionDroppableId(overId)) return;

    const targetSectionId = overBlock?.sectionId ?? getSectionIdFromDroppableId(overId);
    const syncedPreview = updateBlockDragPreview(activeBlock);
    if (syncedPreview) {
      return;
    }

    if (targetSectionId !== activeBlock.sectionId) return;
    if (isSectionTextBlock(activeBlock) || (overBlock && isSectionTextBlock(overBlock))) return;

    updateDragPreviewPlacement(null);

    const targetBlocks = config.blocks
      .filter((block) => block.sectionId === targetSectionId && !isSectionTextBlock(block))
      .sort(bySortOrder);
    if (!overBlock) return;

    const targetIndex = targetBlocks.findIndex((block) => block.id === overBlock.id);
    const sourceBlocks = config.blocks.filter((block) => block.sectionId === activeBlock.sectionId).sort(bySortOrder);
    const sourceIndex = sourceBlocks.findIndex((block) => block.id === activeId);

    if (targetIndex < 0) return;
    if (activeBlock.sectionId === targetSectionId && sourceIndex === targetIndex) return;

    updateDragPreviewPlacement({
      blockId: activeId,
      targetSectionId,
      targetIndex,
      ...getPlacementFromDrag({
        sectionId: targetSectionId,
        block: activeBlock,
        pointer: dragPointerRef.current,
        dragRect: getCurrentDragRect(),
        device: editorDevice
      })
    });
  }

  function onDragEnd(event: DragEndEvent) {
    const previewPlacement = dragPreviewPlacementRef.current;
    const finalPointer = dragPointerRef.current;
    const finalDragRect = getCurrentDragRect();
    const { active, over } = event;
    const activeId = String(active.id);
    setActiveDragBlockId(null);
    setDragOverlayRect(null);
    dragStartPointerRef.current = null;
    dragPointerRef.current = null;
    dragPointerOffsetRef.current = null;
    dragPointerUpdatedAtRef.current = 0;
    dragPointerSourceRef.current = null;
    dragOverlayRectRef.current = null;
    activeDragBlockIdRef.current = null;
    cancelDragPreviewSync();
    window.removeEventListener("pointermove", updateDragPointerFromPointerEvent);
    window.removeEventListener("touchmove", updateDragPointerFromTouchEvent);
    updateDragPreviewPlacement(null);

    const activeBlock = config.blocks.find((block) => block.id === activeId);
    if (!activeBlock) return;

    const finalPreviewPlacement =
      previewPlacement?.blockId === activeId
        ? previewPlacement
        : getBlockDragPreviewPlacement({
            config,
            activeBlock,
            pointer: finalPointer,
            dragRect: finalDragRect,
            device: editorDevice,
            previousPlacement: previewPlacement
          });

    if (finalPreviewPlacement?.blockId === activeId) {
      if (
        finalPreviewPlacement.targetSectionId === topLevelBlockSectionId &&
        finalPreviewPlacement.targetContentIndex !== undefined
      ) {
        update(
          moveBlockToContentIndex(
            activeId,
            finalPreviewPlacement.targetContentIndex,
            { columnStart: finalPreviewPlacement.columnStart, rowStart: finalPreviewPlacement.rowStart }
          )
        );
        return;
      }

      update({
        ...config,
        blocks: moveBlockWithPlacement(
          activeId,
          finalPreviewPlacement.targetSectionId,
          finalPreviewPlacement.targetIndex,
          { columnStart: finalPreviewPlacement.columnStart, rowStart: finalPreviewPlacement.rowStart }
        )
      });
      return;
    }

    if (isSectionTextBlock(activeBlock)) return;

    if (!over || active.id === over.id) {
      const placement = getPlacementFromDrag({
        sectionId: activeBlock.sectionId,
        block: activeBlock,
        pointer: finalPointer,
        dragRect: finalDragRect,
        device: editorDevice
      });
      if (placement) {
        update({
          ...config,
          blocks: normalizeBlocks(config.blocks).map((block) =>
            block.id === activeId ? applyBlockPlacement(block, editorDevice, placement) : block
          )
        });
      }
      return;
    }
    const overId = String(over.id);

    const overBlock = config.blocks.find((block) => block.id === overId);
    if (!overBlock && !isSectionDroppableId(overId)) return;

    const targetSectionId = overBlock?.sectionId ?? getSectionIdFromDroppableId(overId);
    if (targetSectionId !== activeBlock.sectionId) return;
    if (!overBlock && targetSectionId === activeBlock.sectionId) return;
    if (overBlock && isSectionTextBlock(overBlock)) return;

    const targetBlocks = config.blocks
      .filter((block) => block.sectionId === targetSectionId && !isSectionTextBlock(block))
      .sort(bySortOrder);
    const targetIndex =
      previewPlacement?.blockId === activeId && previewPlacement.targetSectionId === targetSectionId
        ? previewPlacement.targetIndex
        : overBlock
          ? targetBlocks.findIndex((block) => block.id === overBlock.id)
          : targetBlocks.length;

    const placement =
      previewPlacement?.blockId === activeId && previewPlacement.targetSectionId === targetSectionId
        ? { columnStart: previewPlacement.columnStart, rowStart: previewPlacement.rowStart }
        : getPlacementFromDrag({
            sectionId: targetSectionId,
            block: activeBlock,
            pointer: finalPointer,
            dragRect: finalDragRect,
            device: editorDevice
          });

    update({ ...config, blocks: moveBlockWithPlacement(activeId, targetSectionId, targetIndex, placement) });
  }

  function onDragCancel() {
    setActiveDragBlockId(null);
    setDragOverlayRect(null);
    dragStartPointerRef.current = null;
    dragPointerRef.current = null;
    dragPointerOffsetRef.current = null;
    dragPointerUpdatedAtRef.current = 0;
    dragPointerSourceRef.current = null;
    dragOverlayRectRef.current = null;
    activeDragBlockIdRef.current = null;
    clearAdminBlockRectsSnapshot();
    cancelDragPreviewSync();
    window.removeEventListener("pointermove", updateDragPointerFromPointerEvent);
    window.removeEventListener("touchmove", updateDragPointerFromTouchEvent);
    updateDragPreviewPlacement(null);
  }

  const scheduleDragPreviewSync = useCallback(() => {
    if (dragPreviewSyncFrameRef.current !== null) return;
    dragPreviewSyncFrameRef.current = window.requestAnimationFrame(() => {
      dragPreviewSyncFrameRef.current = null;
      const activeId = activeDragBlockIdRef.current;
      if (!activeId) return;
      const currentConfig = configRef.current;
      const activeBlock = currentConfig.blocks.find((block) => block.id === activeId);
      if (!activeBlock) return;

      updateDragPreviewPlacement(
        getBlockDragPreviewPlacement({
          config: currentConfig,
          activeBlock,
          pointer: dragPointerRef.current,
          dragRect: getCurrentDragRect(),
          device: editorDeviceRef.current,
          previousPlacement: dragPreviewPlacementRef.current
        })
      );
    });
  }, []);

  const updateDragPointerFromPointerEvent = useCallback(
    (event: PointerEvent) => {
      dragPointerRef.current = { x: event.clientX, y: event.clientY };
      dragPointerUpdatedAtRef.current = getNow();
      dragPointerSourceRef.current = "native";
      scheduleDragPreviewSync();
    },
    [scheduleDragPreviewSync]
  );

  const updateDragPointerFromTouchEvent = useCallback(
    (event: TouchEvent) => {
      const touch = event.touches[0] ?? event.changedTouches[0];
      if (!touch) return;
      dragPointerRef.current = { x: touch.clientX, y: touch.clientY };
      dragPointerUpdatedAtRef.current = getNow();
      dragPointerSourceRef.current = "native";
      scheduleDragPreviewSync();
    },
    [scheduleDragPreviewSync]
  );

  function updateBlockDragPreview(activeBlock: Block) {
    const pointer = dragPointerRef.current;
    const next = getBlockDragPreviewPlacement({
      config,
      activeBlock,
      pointer,
      dragRect: getCurrentDragRect(),
      device: editorDevice,
      previousPlacement: dragPreviewPlacementRef.current
    });
    updateDragPreviewPlacement(next);
    return next;
  }

  function cancelDragPreviewSync() {
    if (dragPreviewSyncFrameRef.current === null) return;
    window.cancelAnimationFrame(dragPreviewSyncFrameRef.current);
    dragPreviewSyncFrameRef.current = null;
  }

  async function save() {
    const result = validateSiteConfig(config);
    if (!result.success) {
      toast.error("保存失败", { description: result.error });
      return;
    }

    setIsSaving(true);
    const response = await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.data)
    });
    const body = (await response.json().catch(() => null)) as { error?: string; updatedAt?: string } | null;
    setIsSaving(false);

    if (!response.ok) {
      toast.error("保存失败", { description: body?.error ?? "Unknown error" });
      return;
    }

    setConfig((current) => ({ ...current, updatedAt: body?.updatedAt ?? new Date().toISOString() }));
    setIsDirty(false);
    toast.success("已保存");
  }

  return (
    <main className="min-h-screen bg-white text-[#101010]">
      <header className="sticky top-0 z-40 border-b border-[#EAF0F8] bg-white/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-3 px-5 py-3">
          <div>
            <p className="text-sm font-semibold">{config.settings.projectName}</p>
            <p className="text-xs text-[#6B7280]">{isDirty ? "有未保存修改" : "已保存"} · 所见即所得编辑</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setModal({ type: "project-settings" })}>
              <Settings className="h-4 w-4" />
              项目设置
            </Button>
            <Button size="sm" onClick={save} disabled={isSaving || !validation.success}>
              <Save className="h-4 w-4" />
              {isSaving ? "保存中" : "保存"}
            </Button>
          </div>
        </div>
      </header>

      {hasMounted ? (
        <>
          <DndContext
            id="admin-visual-editor-dnd"
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragStart={onDragStart}
            onDragMove={onDragMove}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            onDragCancel={onDragCancel}
          >
            <div className="flex justify-center overflow-x-hidden px-3">
              <div
                style={
                  {
                    "--site-bg": config.theme.backgroundColor,
                    "--site-card": config.theme.cardBackground,
                    "--site-text": config.theme.textColor,
                    "--site-muted": config.theme.mutedTextColor,
                    "--site-border": config.theme.borderColor,
                    "--site-primary": config.theme.primaryColor,
                    width: `${canvasWidth}px`,
                    zoom: canvasScale
                  } as React.CSSProperties & { zoom: number }
                }
                className={cn(
                  "grid gap-8 px-5 pb-28 pt-10 md:px-8 md:pt-14",
                  editorDevice === "desktop" ? "grid-cols-[320px_minmax(0,1fr)] gap-12" : "grid-cols-1"
                )}
              >
                <EditableProfile
                  profile={config.profile}
                  device={editorDevice}
                  onPatch={patchProfile}
                  onEditTags={() => setModal({ type: "tags" })}
                  onEditSocial={() => setModal({ type: "social" })}
                />
                <section className="grid min-w-0 gap-2">
                  <SortableContext
                    items={editorContentItems.flatMap((item) => (item.type === "text-block" ? [item.block.id] : []))}
                    strategy={rectSortingStrategy}
                  >
                    {(() => {
                      const nodes: React.ReactNode[] = [];
                      let contentCursor = 0;
                      let didRenderTextPreview = false;
                      let didRenderGridPreview = false;

                      function pushTextPreview(position: number) {
                        if (!activeDragBlock || !isSectionTextBlock(activeDragBlock)) return;
                        if (didRenderTextPreview) return;
                        if (activeTextPreviewContentIndex !== position) return;
                        didRenderTextPreview = true;
                        nodes.push(<TextBlockDropPreview key={`text-block-preview:${activeDragBlock.id}:${position}`} block={activeDragBlock} />);
                      }

                      function pushStandaloneGridPreview(position: number) {
                        const previewContentIndex = dragPreviewPlacement?.targetContentIndex;
                        if (!activeDragBlock || isSectionTextBlock(activeDragBlock)) return;
                        if (didRenderGridPreview) return;
                        if (dragPreviewPlacement?.blockId !== activeDragBlock.id) return;
                        if (dragPreviewPlacement.targetSectionId !== topLevelBlockSectionId) return;
                        if (previewContentIndex !== position) return;

                        didRenderGridPreview = true;
                        nodes.push(
                          <StandaloneBlockDropPreview
                            key={`block-preview:${activeDragBlock.id}:${position}`}
                            device={editorDevice}
                            block={activeDragBlock}
                            placement={{ columnStart: dragPreviewPlacement.columnStart, rowStart: dragPreviewPlacement.rowStart }}
                          />
                        );
                      }

                      for (const item of editorContentItems) {
                        pushTextPreview(contentCursor);

                        if (item.type === "top-level-blocks") {
                          const contentBlocks = item.blocks.filter((block) => block.id !== activeDragBlockId);
                          const previewContentIndex = dragPreviewPlacement?.targetContentIndex;
                          const shouldShowGridPreview =
                            activeDragBlock !== null &&
                            !isSectionTextBlock(activeDragBlock) &&
                            dragPreviewPlacement?.blockId === activeDragBlock.id &&
                            dragPreviewPlacement.targetSectionId === topLevelBlockSectionId &&
                            !didRenderGridPreview &&
                            previewContentIndex !== undefined &&
                            previewContentIndex >= contentCursor &&
                            previewContentIndex <= contentCursor + contentBlocks.length;
                          if (shouldShowGridPreview) {
                            didRenderGridPreview = true;
                          }

                          nodes.push(
                            <EditableSection
                              key={item.id}
                              section={topLevelSection}
                              contentGroupId={item.id}
                              blocks={item.blocks}
                              onEditSection={() => undefined}
                              onDeleteSection={() => undefined}
                              onEditBlock={(blockId) => setModal({ type: "block", blockId })}
                              onDeleteBlock={deleteBlock}
                              onSelectBlock={setSelectedBlockId}
                              device={editorDevice}
                              activeDragBlockId={activeDragBlockId}
                              dragPreviewBlock={activeDragBlock}
                              dragPreviewPlacement={
                                shouldShowGridPreview && dragPreviewPlacement
                                  ? {
                                      ...dragPreviewPlacement,
                                      targetIndex: (previewContentIndex ?? contentCursor) - contentCursor
                                    }
                                  : null
                              }
                              onResizeBlock={patchBlockSizeForDevice}
                              onResizePreview={setResizePreviewSize}
                              resizeDrafts={resizeDrafts}
                              onResizeDraft={(blockId, size) =>
                                setResizeDrafts((current) => {
                                  if (!size) {
                                    const next = { ...current };
                                    delete next[blockId];
                                    return next;
                                  }
                                  return { ...current, [blockId]: size };
                                })
                              }
                              sectionHandleProps={{}}
                              hideHeader
                              showDragPreview={shouldShowGridPreview}
                            />
                          );
                          contentCursor += contentBlocks.length;
                          continue;
                        }

                        pushStandaloneGridPreview(contentCursor);
                        nodes.push(
                          <SortableTextBlock
                            key={item.id}
                            block={item.block}
                            device={editorDevice}
                            isDragOverlayActive={activeDragBlockId === item.block.id}
                            disableSortableTransform={activeDragBlockId !== null}
                            removeFromFlowDuringDrag={
                              activeTextPreviewContentIndex !== undefined && activeDragBlockId === item.block.id
                            }
                            onEdit={() => setModal({ type: "block", blockId: item.block.id })}
                            onDelete={() => deleteBlock(item.block.id)}
                            onSelect={() => setSelectedBlockId(item.block.id)}
                          />
                        );
                        if (item.block.id !== activeDragBlockId) {
                          contentCursor += 1;
                        }
                      }

                      pushTextPreview(contentCursor);
                      pushStandaloneGridPreview(contentCursor);
                      return nodes;
                    })()}
                  </SortableContext>
                </section>
              </div>
            </div>
            <DragOverlay
              adjustScale={false}
              dropAnimation={{
                duration: 220,
                easing: "cubic-bezier(0.22, 1, 0.36, 1)"
              }}
            >
              {activeDragBlock && dragOverlayRect ? (
                <div
                  style={{
                    width: dragOverlayRect.width,
                    height: dragOverlayRect.height,
                    minWidth: dragOverlayRect.width,
                    minHeight: dragOverlayRect.height,
                    maxWidth: dragOverlayRect.width,
                    maxHeight: dragOverlayRect.height
                  }}
                  className="pointer-events-none box-border shrink-0 scale-[1.035] cursor-grabbing overflow-hidden rounded-[20px] opacity-95 shadow-[0_24px_70px_rgba(15,23,42,0.24)]"
                >
                  <DragOverlayBlockPreview
                    block={activeDragBlock}
                    width={dragOverlayRect.width}
                    height={dragOverlayRect.height}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          <FloatingToolbar
            device={editorDevice}
            canEditDesktop={canEditDesktop}
            onDeviceChange={(device) => {
              if (device === "desktop" && !canEditDesktop) return;
              setResizeDrafts({});
              setResizePreviewSize(null);
              setEditorDevice(device);
            }}
            onAddBlock={() => setModal({ type: "add-block" })}
            onAddSection={addSection}
          />
          {resizePreviewSize ? <ResizePreview activeSize={resizePreviewSize} /> : null}
        </>
      ) : null}

      {modal ? (
        <EditorModal
          title={modalTitle(modal)}
          onClose={() => setModal(null)}
          onSave={save}
          isSaving={isSaving}
          footerStart={
            modal.type === "block" ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => deleteBlock(modal.blockId)}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                删除/delete
              </Button>
            ) : null
          }
        >
          {modal.type === "tags" ? <TagsQuickForm profile={config.profile} onPatch={patchProfile} /> : null}
          {modal.type === "social" ? <SocialLinksQuickForm profile={config.profile} onPatch={patchProfile} /> : null}
          {modal.type === "block" ? (
            <BlockModalBody
              block={config.blocks.find((block) => block.id === modal.blockId)}
              onPatch={(patch) => patchBlock(modal.blockId, patch)}
            />
          ) : null}
          {modal.type === "add-block" ? <AddBlockDialog onAdd={addBlock} /> : null}
          {modal.type === "project-settings" ? (
            <ProjectSettingsForm config={config} onChange={update} onExport={exportConfig} onImport={importConfig} />
          ) : null}
        </EditorModal>
      ) : null}
    </main>
  );
}

function EditableProfile({
  profile,
  device,
  onPatch,
  onEditTags,
  onEditSocial
}: {
  profile: Profile;
  device: LayoutDevice;
  onPatch: (patch: Partial<Profile>) => void;
  onEditTags: () => void;
  onEditSocial: () => void;
}) {
  return (
    <aside className={cn(device === "desktop" && "sticky top-24 self-start")}>
      <div className="grid w-full gap-5 rounded-[28px] bg-white p-6 text-left">
        <span className="group/avatar relative w-fit">
          <img src={profile.avatarUrl || "/default-avatar.svg"} alt="" className="h-36 w-36 rounded-full object-cover" />
          <div className="absolute right-1 top-1 opacity-0 transition group-hover/avatar:opacity-100">
            <ImageCropUploader
              folder="avatar"
              value=""
              shape="circle"
              label=""
              buttonText="编辑"
              buttonIconOnly
              buttonClassName="h-9 w-9 rounded-full border border-[#EAEAEA] bg-white p-0 text-black shadow-soft hover:bg-white"
              onUploaded={(url) => onPatch({ avatarUrl: url })}
            />
          </div>
        </span>
        <div className="grid gap-3">
          <InlineProfileText
            value={profile.displayName}
            className="rounded-xl px-1 text-3xl font-bold leading-tight tracking-normal hover:bg-[#F1F5F9]"
            inputClassName="text-3xl font-bold"
            onChange={(displayName) => onPatch({ displayName })}
          />
          <InlineProfileText
            value={profile.headline}
            className="rounded-xl px-1 text-base font-medium leading-6 hover:bg-[#F1F5F9]"
            onChange={(headline) => onPatch({ headline })}
          />
          <div className="text-base leading-6">
            <InlineProfileText
              value={profile.bio}
              multiline
              className="rounded-xl px-1 text-sm leading-7 text-[#64748B] hover:bg-[#F1F5F9]"
              onChange={(bio) => onPatch({ bio })}
            />
          </div>
          <InlineProfileText
            value={profile.location ?? ""}
            placeholder="添加 base/location"
            className="inline-flex w-fit rounded-xl px-1 text-sm text-[#64748B] hover:bg-[#F1F5F9]"
            onChange={(location) => onPatch({ location })}
            prefix={<MapPin className="h-4 w-4" />}
          />
          <div className="flex flex-wrap gap-2">
            {profile.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-[#EAF0F8] bg-white px-3 py-1.5 text-sm shadow-sm">
                {tag}
              </span>
            ))}
          </div>
          <button type="button" onClick={onEditTags} className="w-fit rounded-full border border-dashed border-[#D9E6F8] px-3 py-1.5 text-sm font-medium text-[#1479FF]">
            <Pencil className="mr-1 inline h-3.5 w-3.5" />
            修改/添加 Tag
          </button>
          <div className="flex flex-wrap gap-2">
            {[...profile.socialLinks]
              .filter((link) => link.isVisible)
              .sort(bySortOrder)
              .map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={onEditSocial}
                  className="inline-flex items-center gap-2 rounded-full border border-[#EAEAEA] bg-white px-3 py-2 text-sm font-medium shadow-sm transition hover:border-[#1479FF]/40 hover:text-[#1479FF]"
                >
                  <SocialIcon name={link.icon} />
                  {link.label}
                </button>
              ))}
            <button type="button" onClick={onEditSocial} className="inline-flex items-center gap-2 rounded-full border border-dashed border-[#D9E6F8] px-3 py-2 text-sm font-medium text-[#1479FF]">
              <Plus className="h-3.5 w-3.5" />
              社交按钮/social
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function InlineProfileText({
  value,
  placeholder = "点击编辑",
  multiline = false,
  className,
  inputClassName,
  prefix,
  onChange
}: {
  value: string;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  inputClassName?: string;
  prefix?: React.ReactNode;
  onChange: (value: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function commit() {
    setIsEditing(false);
    if (draft !== value) {
      onChange(draft);
    }
  }

  if (isEditing) {
    if (multiline) {
      return (
        <Textarea
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          className={cn("min-h-24", inputClassName)}
        />
      );
    }

    return (
      <Input
        autoFocus
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
          if (event.key === "Escape") {
            setDraft(value);
            setIsEditing(false);
          }
        }}
        className={inputClassName}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(value);
        setIsEditing(true);
      }}
      className={cn("min-h-7 text-left transition", className)}
    >
      <span className="inline-flex items-center gap-1.5">
        {prefix}
        {value || <span className="text-[#9CA3AF]">{placeholder}</span>}
      </span>
    </button>
  );
}

const socialIconPresets = ["link", "github", "twitter", "instagram", "youtube", "linkedin", "website", "mail"] as const;

function SocialIcon({ name }: { name?: string }) {
  const iconClass = "h-4 w-4";
  if (name === "github") return <Github className={iconClass} />;
  if (name === "twitter" || name === "x") return <Twitter className={iconClass} />;
  if (name === "instagram") return <Instagram className={iconClass} />;
  if (name === "youtube") return <Youtube className={iconClass} />;
  if (name === "linkedin") return <Linkedin className={iconClass} />;
  if (name === "website" || name === "globe") return <Globe2 className={iconClass} />;
  if (name === "mail" || name === "email") return <Mail className={iconClass} />;
  return <LinkIcon className={iconClass} />;
}

function inferSocialIconFromUrl(value: string, currentIcon?: string) {
  if (!value || value === "https://") return currentIcon || "link";
  const lowerValue = value.toLowerCase();
  if (lowerValue.includes("github.com")) return "github";
  if (lowerValue.includes("twitter.com") || lowerValue.includes("x.com")) return "twitter";
  if (lowerValue.includes("instagram.com")) return "instagram";
  if (lowerValue.includes("youtube.com") || lowerValue.includes("youtu.be")) return "youtube";
  if (lowerValue.includes("linkedin.com")) return "linkedin";
  if (lowerValue.startsWith("mailto:")) return "mail";
  return currentIcon || "website";
}

function inferSocialLabelFromUrl(value: string) {
  const icon = inferSocialIconFromUrl(value);
  if (icon === "github") return "GitHub";
  if (icon === "twitter") return "X";
  if (icon === "instagram") return "Instagram";
  if (icon === "youtube") return "YouTube";
  if (icon === "linkedin") return "LinkedIn";
  if (icon === "mail") return "Email";
  return "Website";
}

function moveItem<T>(items: T[], oldIndex: number, newIndex: number) {
  if (oldIndex === newIndex) return items;
  const next = [...items];
  const [item] = next.splice(oldIndex, 1);
  next.splice(newIndex, 0, item);
  return next;
}

function getContentFlowForBlockMove(renderModel: ReturnType<typeof buildRenderModel>, activeBlockId: string): ContentFlowItem[] {
  const flowItems: ContentFlowItem[] = [];

  for (const item of renderModel.orderedContentItems) {
    if (item.type === "top-level-blocks") {
      flowItems.push(
        ...item.blocks
          .filter((block) => block.id !== activeBlockId)
          .map((block) => ({ type: "top-level-block" as const, id: block.id, block }))
      );
      continue;
    }

    if (item.block.id !== activeBlockId) {
      flowItems.push({ type: "text-block", id: item.id, block: item.block });
    }
  }

  return flowItems;
}

function DragOverlayBlockPreview({ block, width, height }: { block: Block; width: number; height: number }) {
  if (isSectionTextBlock(block)) {
    return <DragOverlayTextBlockPreview block={block} width={width} height={height} />;
  }

  return (
    <div
      className="relative box-border overflow-hidden rounded-[20px] border border-[#111] bg-white p-4 ring-2 ring-[#1479FF]/25"
      style={{ width, height }}
    >
      {block.coverImage ? (
        <>
          <img src={block.coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
          <div className="absolute inset-x-4 bottom-4 z-10">
            <span className="line-clamp-2 inline-block max-w-full rounded-[18px] border border-[#E5E7EB] bg-white/95 px-3 py-1.5 text-sm font-semibold leading-5 text-[#111] shadow-soft">
              {block.title}
            </span>
          </div>
        </>
      ) : (
        <div className="flex h-full flex-col justify-between gap-3">
          <div className="grid gap-2">
            {block.icon ? <span className="text-[#1479FF]">{block.icon}</span> : null}
            <h3 className="line-clamp-2 text-lg font-semibold leading-tight">{block.title}</h3>
            {block.subtitle ? <p className="line-clamp-2 text-sm text-[#475569]">{block.subtitle}</p> : null}
            {block.description ? <p className="line-clamp-3 text-sm leading-6 text-[#555]">{block.description}</p> : null}
          </div>
          {block.badge ? (
            <span className="line-clamp-2 w-fit max-w-full rounded-[18px] border border-[#E5E7EB] bg-white/95 px-3 py-1.5 text-xs font-semibold leading-5 text-[#475569] shadow-soft">
              {block.badge}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}

function DragOverlayTextBlockPreview({ block, width, height }: { block: Block; width: number; height: number }) {
  const rawTitleSize = block.metadata?.titleSize;
  const rawTitleAlign = block.metadata?.titleAlign;
  const titleSize = rawTitleSize === "sm" || rawTitleSize === "lg" ? rawTitleSize : "md";
  const titleAlign = rawTitleAlign === "center" || rawTitleAlign === "right" ? rawTitleAlign : "left";
  const subtitle = block.subtitle || block.description;
  const titleClass = titleSize === "lg" ? "text-[25px]" : titleSize === "sm" ? "text-lg" : "text-[22px]";

  return (
    <div
      className={cn(
        "flex box-border h-full w-full flex-col justify-center overflow-hidden rounded-[20px] border border-[#111] bg-white px-3.5 py-2.5 ring-2 ring-[#1479FF]/25",
        titleAlign === "center" && "items-center text-center",
        titleAlign === "right" && "items-end text-right",
        titleAlign === "left" && "items-start text-left"
      )}
      style={{ width, height }}
    >
      <h3 className={cn("max-w-full truncate font-bold leading-tight tracking-normal text-[#111]", titleClass)}>
        {block.title.trim()}
        {block.icon ? <span className="ml-1 text-[#1479FF]">{block.icon}</span> : null}
      </h3>
      {subtitle ? <p className="mt-1 max-w-full truncate text-sm leading-5 text-[#64748B]">{subtitle}</p> : null}
    </div>
  );
}

function getAdminBlockVisualRect(blockId: string) {
  return getMeasuredAdminBlockRect(blockId);
}

function getDragOverlayRect(block: Block, rect: RectLike, device: LayoutDevice): DragOverlayRect {
  const displaySize = getBlockSize(block, device);
  if (displaySize === "small-square" || displaySize === "large-square") {
    const side = Math.min(rect.width, rect.height);
    return { width: side, height: side };
  }

  return { width: rect.width, height: rect.height };
}

function findAdminBlockElement(blockId: string) {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-admin-block-id]")).find(
    (element) => element.dataset.adminBlockId === blockId
  );
}

function captureAdminBlockRects() {
  const rects = new Map<string, MeasuredRect>();
  for (const element of document.querySelectorAll<HTMLElement>("[data-admin-block-id]")) {
    const blockId = element.dataset.adminBlockId;
    if (!blockId) continue;
    rects.set(blockId, copyMeasuredRect(element.getBoundingClientRect()));
  }
  adminDragBlockRectsSnapshot = rects;
  return rects;
}

function clearAdminBlockRectsSnapshot() {
  adminDragBlockRectsSnapshot = new Map();
}

function getMeasuredAdminBlockRect(blockId: string) {
  const snapshotRect = adminDragBlockRectsSnapshot.get(blockId);
  if (snapshotRect) return snapshotRect;

  const element = findAdminBlockElement(blockId);
  const rect = element?.getBoundingClientRect();
  return rect ? copyMeasuredRect(rect) : null;
}

function copyMeasuredRect(rect: DOMRectReadOnly): MeasuredRect {
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    right: rect.right,
    bottom: rect.bottom
  };
}

function getClientPoint(event: Event): Point | null {
  if (event instanceof MouseEvent) {
    return { x: event.clientX, y: event.clientY };
  }

  if (typeof TouchEvent !== "undefined" && event instanceof TouchEvent && event.touches.length > 0) {
    const touch = event.touches[0];
    return { x: touch.clientX, y: touch.clientY };
  }

  if (typeof TouchEvent !== "undefined" && event instanceof TouchEvent && event.changedTouches.length > 0) {
    const touch = event.changedTouches[0];
    return { x: touch.clientX, y: touch.clientY };
  }

  return null;
}

function getNow() {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}

function isSectionDroppableId(id: string) {
  return id.startsWith("section:") || id.startsWith("content-group:");
}

function getSectionIdFromDroppableId(id: string) {
  if (id.startsWith("content-group:")) return topLevelBlockSectionId;
  if (id.startsWith("section:")) return id.replace("section:", "");
  return topLevelBlockSectionId;
}

function getBlockDragPreviewPlacement({
  config,
  activeBlock,
  pointer,
  dragRect,
  device,
  previousPlacement
}: {
  config: SiteConfig;
  activeBlock: Block;
  pointer: Point | null;
  dragRect: MeasuredRect | null;
  device: LayoutDevice;
  previousPlacement?: DragPreviewPlacement | null;
}): DragPreviewPlacement | null {
  const contentTarget = getTopLevelContentTargetFromDrag(config, activeBlock, pointer, dragRect);
  if (contentTarget) {
    const placement = isSectionTextBlock(activeBlock)
      ? undefined
      : getPlacementFromDrag({
          sectionId: topLevelBlockSectionId,
          block: activeBlock,
          pointer,
          dragRect,
          device
        });

    return {
      blockId: activeBlock.id,
      targetSectionId: topLevelBlockSectionId,
      targetIndex: contentTarget.targetIndex,
      targetContentIndex: contentTarget.targetContentIndex,
      ...placement
    };
  }

  if (isSectionTextBlock(activeBlock)) {
    const fallbackIndex = getContentTargetIndexFromPointer(
      getContentFlowForBlockMove(buildRenderModel(config), activeBlock.id),
      pointer ?? getDragCenterPoint(dragRect)
    );

    return {
      blockId: activeBlock.id,
      targetSectionId: topLevelBlockSectionId,
      targetIndex: 0,
      targetContentIndex: fallbackIndex ?? 0
    };
  }

  const targetSectionId = topLevelBlockSectionId;

  const targetBlocks = config.blocks
    .filter((block) => block.sectionId === targetSectionId && block.id !== activeBlock.id && !isSectionTextBlock(block))
    .sort(bySortOrder);
  const targetIndex =
    getInsertionIndexFromPointer({
      targetBlocks,
      pointer,
      dragRect,
      activeBlock,
      targetSectionId,
      device
    }) ??
    (previousPlacement?.blockId === activeBlock.id && previousPlacement.targetSectionId === targetSectionId
      ? previousPlacement.targetIndex
      : targetBlocks.length);
  const placement = getPlacementFromDrag({ sectionId: targetSectionId, block: activeBlock, pointer, dragRect, device });

  return { blockId: activeBlock.id, targetSectionId, targetIndex, ...placement };
}

function getTopLevelContentTargetFromDrag(
  config: SiteConfig,
  activeBlock: Block,
  pointer: Point | null,
  dragRect: MeasuredRect | null
) {
  const intentPoint = pointer ?? getDragCenterPoint(dragRect);
  if (!intentPoint) return null;

  const flowItems = getContentFlowForBlockMove(buildRenderModel(config), activeBlock.id);
  const groupTarget = getTopLevelContentGroupTarget(config, activeBlock, intentPoint);
  if (groupTarget) {
    return groupTarget;
  }

  for (let index = 0; index < flowItems.length; index += 1) {
    const item = flowItems[index];
    if (item.type !== "text-block") continue;

    const rect = getMeasuredAdminBlockRect(item.id);
    if (!rect) continue;

    const verticalIntentBand = Math.max(20, rect.height * 0.65);
    const horizontalIntentBand = 96;
    const isVerticallyNear = intentPoint.y >= rect.top - verticalIntentBand && intentPoint.y <= rect.bottom + verticalIntentBand;
    const isHorizontallyNear = intentPoint.x >= rect.left - horizontalIntentBand && intentPoint.x <= rect.right + horizontalIntentBand;
    if (!isVerticallyNear || !isHorizontallyNear) continue;

    const insertAfter = intentPoint.y > rect.top + rect.height / 2;
    return { targetContentIndex: index + (insertAfter ? 1 : 0), targetIndex: 0 };
  }

  const gapTargetIndex = getContentGapTargetIndexFromPointer(flowItems, intentPoint);
  if (gapTargetIndex !== null) {
    return { targetContentIndex: gapTargetIndex, targetIndex: 0 };
  }

  return null;
}

function getTopLevelContentGroupTarget(config: SiteConfig, activeBlock: Block, intentPoint: Point) {
  const groups = getTopLevelContentGroupTargets(config, activeBlock.id);
  const candidates = groups
    .map((group) => {
      const gridElement = findAdminContentGroupGridElement(group.id);
      if (!gridElement) return null;

      const rect = gridElement.getBoundingClientRect();
      const verticalBand = Math.max(48, rect.height * 0.18);
      const horizontalBand = 96;
      const isNear =
        intentPoint.y >= rect.top - verticalBand &&
        intentPoint.y <= rect.bottom + verticalBand &&
        intentPoint.x >= rect.left - horizontalBand &&
        intentPoint.x <= rect.right + horizontalBand;
      if (!isNear) return null;

      return {
        group,
        rect,
        distance: getDistanceToRect(intentPoint, rect)
      };
    })
    .filter((item): item is { group: ContentGroupTarget; rect: DOMRect; distance: number } => item !== null)
    .sort((a, b) => a.distance - b.distance);

  const candidate = candidates[0];
  if (!candidate) return null;

  if (isSectionTextBlock(activeBlock)) {
    const insertAfterGroup = intentPoint.y > candidate.rect.top + candidate.rect.height / 2;
    return {
      targetContentIndex: candidate.group.startIndex + (insertAfterGroup ? candidate.group.blocks.length : 0),
      targetIndex: 0
    };
  }

  const targetIndex = getInsertionIndexFromBlockRects(candidate.group.blocks, intentPoint);
  return {
    targetContentIndex: candidate.group.startIndex + targetIndex,
    targetIndex
  };
}

type ContentGroupTarget = {
  id: string;
  blocks: Block[];
  startIndex: number;
};

function getTopLevelContentGroupTargets(config: SiteConfig, activeBlockId: string): ContentGroupTarget[] {
  const renderModel = buildRenderModel(config);
  const groups: ContentGroupTarget[] = [];
  let flowIndex = 0;

  for (const item of renderModel.orderedContentItems) {
    if (item.type === "top-level-blocks") {
      const blocks = item.blocks.filter((block) => block.id !== activeBlockId);
      const startIndex = flowIndex;
      flowIndex += blocks.length;
      if (blocks.length > 0) {
        groups.push({ id: item.id, blocks, startIndex });
      }
      continue;
    }

    if (item.block.id !== activeBlockId) {
      flowIndex += 1;
    }
  }

  return groups;
}

function getContentTargetIndexFromPointer(flowItems: ContentFlowItem[], pointer: Point | null) {
  if (!pointer) return null;

  const measuredItems = flowItems
    .map((item, index) => {
      const rect = getMeasuredAdminBlockRect(item.id);
      return rect ? { index, rect } : null;
    })
    .filter((item): item is { index: number; rect: MeasuredRect } => item !== null)
    .sort((a, b) => (Math.abs(a.rect.top - b.rect.top) > 8 ? a.rect.top - b.rect.top : a.rect.left - b.rect.left));

  for (const item of measuredItems) {
    if (pointer.y < item.rect.top + item.rect.height / 2) return item.index;
  }

  return flowItems.length;
}

function getContentGapTargetIndexFromPointer(flowItems: ContentFlowItem[], pointer: Point) {
  const measuredItems = flowItems
    .map((item, index) => {
      const rect = getMeasuredAdminBlockRect(item.id);
      return rect ? { index, rect } : null;
    })
    .filter((item): item is { index: number; rect: MeasuredRect } => item !== null)
    .sort((a, b) => (Math.abs(a.rect.top - b.rect.top) > 8 ? a.rect.top - b.rect.top : a.rect.left - b.rect.left));

  if (measuredItems.length === 0) return null;

  const first = measuredItems[0];
  const last = measuredItems[measuredItems.length - 1];
  const topBand = Math.max(64, first.rect.height * 0.85);
  const bottomBand = Math.max(64, last.rect.height * 0.85);
  if (pointer.y >= first.rect.top - topBand && pointer.y < first.rect.top + first.rect.height / 2) {
    return first.index;
  }
  if (pointer.y > last.rect.top + last.rect.height / 2 && pointer.y <= last.rect.bottom + bottomBand) {
    return flowItems.length;
  }

  for (let index = 0; index < measuredItems.length - 1; index += 1) {
    const current = measuredItems[index];
    const next = measuredItems[index + 1];
    const gapTop = current.rect.bottom;
    const gapBottom = next.rect.top;
    if (gapBottom <= gapTop) continue;
    if (pointer.y >= gapTop && pointer.y <= gapBottom) {
      return next.index;
    }
  }

  return null;
}

function getPlacementFromDrag({
  sectionId,
  block,
  pointer,
  dragRect,
  device
}: {
  sectionId: string;
  block: Block;
  pointer: Point | null;
  dragRect: MeasuredRect | null;
  device: LayoutDevice;
}): BlockPlacementDraft | undefined {
  const metrics = getAdminSectionGridMetrics(sectionId, device, pointer, dragRect);
  if (!metrics || (!pointer && !dragRect)) return undefined;

  const size = getBlockSize(block, device);
  const logicalColumnSpan = getLogicalColumnSpan(size, device);
  const logicalColumns = getLogicalColumnCount(device);
  const maxColumnStart = logicalColumns - logicalColumnSpan + 1;
  const width = getGridItemWidth(getDefaultGridSpan(size, device), metrics);
  const height = getDefaultRowSpan(size) * metrics.rowHeight + (getDefaultRowSpan(size) - 1) * metrics.rowGap;
  const anchorX = dragRect ? dragRect.left : pointer ? pointer.x - width / 2 : metrics.rect.left;
  const anchorY = dragRect ? dragRect.top : pointer ? pointer.y - height / 2 : metrics.rect.top;
  const logicalCellWidth = getGridItemWidth(device === "desktop" ? 4 : 6, metrics);
  const logicalColumnUnit = logicalCellWidth + metrics.columnGap;
  const logicalRowUnit = metrics.rowHeight + metrics.rowGap;
  const columnStart = clamp(Math.round((anchorX - metrics.rect.left) / logicalColumnUnit) + 1, 1, maxColumnStart);
  const rowStart = clamp(Math.round((anchorY - metrics.rect.top) / logicalRowUnit) + 1, 1, 240);

  return { columnStart, rowStart };
}

function getDragIntentPoint(pointer: Point | null, dragRect: MeasuredRect | null): Point | null {
  if (dragRect) {
    return {
      x: dragRect.left + Math.min(48, dragRect.width * 0.18),
      y: dragRect.top + Math.min(48, dragRect.height * 0.18)
    };
  }

  return pointer;
}

function getDragCenterPoint(dragRect: MeasuredRect | null): Point | null {
  if (!dragRect) return null;
  return {
    x: dragRect.left + dragRect.width / 2,
    y: dragRect.top + dragRect.height / 2
  };
}

function getInsertionIndexFromPointer({
  targetBlocks,
  pointer,
  dragRect,
  activeBlock,
  targetSectionId,
  device
}: {
  targetBlocks: Block[];
  pointer: Point | null;
  dragRect: MeasuredRect | null;
  activeBlock: Block;
  targetSectionId: string;
  device: LayoutDevice;
}) {
  if (!pointer && !dragRect) return null;
  if (pointer && isPointerInBlockInsertionBand(targetBlocks, pointer)) {
    return getInsertionIndexFromBlockRects(targetBlocks, pointer);
  }

  const simulatedIndex = getSimulatedGridInsertionIndex(targetBlocks, pointer, dragRect, activeBlock, targetSectionId, device);
  if (simulatedIndex !== null) return simulatedIndex;

  if (dragRect) {
    return getInsertionIndexFromBlockRects(
      targetBlocks,
      getDragCenterPoint(dragRect) ?? {
        x: dragRect.left,
        y: dragRect.top
      }
    );
  }

  return pointer ? getInsertionIndexFromBlockRects(targetBlocks, pointer) : null;
}

function isPointerInBlockInsertionBand(targetBlocks: Block[], pointer: Point) {
  return targetBlocks.some((block) => {
    const rect = getMeasuredAdminBlockRect(block.id);
    if (!rect) return false;

    const verticalBand = Math.max(48, rect.height * 0.42);
    const horizontalBand = Math.max(36, rect.width * 0.18);
    return (
      pointer.y >= rect.top - verticalBand &&
      pointer.y <= rect.bottom + verticalBand &&
      pointer.x >= rect.left - horizontalBand &&
      pointer.x <= rect.right + horizontalBand
    );
  });
}

function getSimulatedGridInsertionIndex(
  targetBlocks: Block[],
  pointer: Point | null,
  dragRect: MeasuredRect | null,
  activeBlock: Block,
  targetSectionId: string,
  device: LayoutDevice
) {
  const metrics = getAdminSectionGridMetrics(targetSectionId, device, pointer, dragRect);
  if (!metrics) return null;

  let bestCandidate: { index: number; score: number } | null = null;
  for (let index = 0; index <= targetBlocks.length; index += 1) {
    const placement = simulateActiveGridPlacement(targetBlocks, activeBlock, index, device, metrics.columns);
    if (!placement) continue;
    const rect = getGridPlacementRect(placement, metrics);
    const pointerScore = pointer ? getPointerToPlacementScore(pointer, rect) : Number.POSITIVE_INFINITY;
    const dragScore = dragRect ? getDragRectToPlacementScore(dragRect, rect) : Number.POSITIVE_INFINITY;
    const score = dragRect ? dragScore + Math.min(pointerScore, 160) * 0.2 : pointerScore;

    if (!bestCandidate || score < bestCandidate.score) {
      bestCandidate = { index, score };
    }
  }

  return bestCandidate?.index ?? null;
}

function getAdminSectionGridMetrics(
  sectionId: string,
  device: LayoutDevice,
  pointer?: Point | null,
  dragRect?: MeasuredRect | null
): GridMetrics | null {
  const gridElement = findAdminSectionGridElement(sectionId, pointer, dragRect);
  if (!gridElement) return null;

  const rect = gridElement.getBoundingClientRect();
  if (rect.width <= 0) return null;

  const columns = 12;
  const scale = gridElement.offsetWidth > 0 ? rect.width / gridElement.offsetWidth : 1;
  const styles = window.getComputedStyle(gridElement);
  const rawColumnGap = Number.parseFloat(styles.columnGap || styles.gap || "16");
  const rawRowGap = Number.parseFloat(styles.rowGap || styles.gap || "16");
  const columnGap = Number.isFinite(rawColumnGap) ? rawColumnGap * scale : 16 * scale;
  const rowGap = Number.isFinite(rawRowGap) ? rawRowGap * scale : columnGap;
  const columnWidth = (rect.width - columnGap * (columns - 1)) / columns;
  const minSpan = device === "desktop" ? 4 : 6;
  const rowHeight = columnWidth * minSpan + columnGap * (minSpan - 1);

  return {
    rect,
    columns,
    columnWidth,
    rowHeight,
    columnGap,
    rowGap
  };
}

function simulateActiveGridPlacement(
  targetBlocks: Block[],
  activeBlock: Block,
  insertionIndex: number,
  device: LayoutDevice,
  columns: number
) {
  const sequence: Array<{ columnSpan: number; rowSpan: number; columnStart?: number; rowStart?: number; isActive: boolean }> = [];

  targetBlocks.forEach((block, index) => {
    if (index === insertionIndex) {
      sequence.push(getGridItemShape(activeBlock, device, true));
    }
    sequence.push(getGridItemShape(block, device, false));
  });

  if (insertionIndex === targetBlocks.length) {
    sequence.push(getGridItemShape(activeBlock, device, true));
  }

  const occupied: boolean[][] = [];
  for (const item of sequence) {
    const placement = placeGridItem(occupied, columns, item.columnSpan, item.rowSpan, item.columnStart, item.rowStart);
    if (item.isActive) return placement;
  }

  return null;
}

function getGridItemShape(block: Block, device: LayoutDevice, isActive: boolean) {
  const size = getBlockSize(block, device);
  return {
    columnSpan: getDefaultGridSpan(size, device),
    rowSpan: getDefaultRowSpan(size),
    columnStart: getBlockColumnStart(block, device),
    rowStart: getBlockRowStart(block, device),
    isActive
  };
}

function placeGridItem(
  occupied: boolean[][],
  columns: number,
  rawColumnSpan: number,
  rawRowSpan: number,
  rawColumnStart?: number,
  rawRowStart?: number
): GridPlacement {
  const columnSpan = clamp(rawColumnSpan, 1, columns);
  const rowSpan = Math.max(1, rawRowSpan);
  const preferredColumn = rawColumnStart ? clamp(rawColumnStart - 1, 0, columns - columnSpan) : null;
  const preferredRow = rawRowStart ? clamp(rawRowStart - 1, 0, 239) : null;

  const rowsToTry =
    preferredRow === null
      ? Array.from({ length: 240 }, (_, row) => row)
      : [preferredRow, ...Array.from({ length: 240 }, (_, row) => row).filter((row) => row !== preferredRow)];

  for (const row of rowsToTry) {
    ensureGridRows(occupied, row + rowSpan, columns);
    const columnsToTry =
      preferredColumn === null
        ? Array.from({ length: columns - columnSpan + 1 }, (_, column) => column)
        : [
            preferredColumn,
            ...Array.from({ length: columns - columnSpan + 1 }, (_, column) => column).filter(
              (column) => column !== preferredColumn
            )
          ];

    for (const column of columnsToTry) {
      if (!canPlaceGridItem(occupied, column, row, columnSpan, rowSpan)) continue;
      occupyGridItem(occupied, column, row, columnSpan, rowSpan);
      return { column, row, columnSpan, rowSpan };
    }
  }

  return { column: 0, row: occupied.length, columnSpan, rowSpan };
}

function ensureGridRows(occupied: boolean[][], rowCount: number, columns: number) {
  while (occupied.length < rowCount) {
    occupied.push(Array.from({ length: columns }, () => false));
  }
}

function canPlaceGridItem(
  occupied: boolean[][],
  column: number,
  row: number,
  columnSpan: number,
  rowSpan: number
) {
  for (let rowOffset = 0; rowOffset < rowSpan; rowOffset += 1) {
    for (let columnOffset = 0; columnOffset < columnSpan; columnOffset += 1) {
      if (occupied[row + rowOffset]?.[column + columnOffset]) return false;
    }
  }
  return true;
}

function occupyGridItem(occupied: boolean[][], column: number, row: number, columnSpan: number, rowSpan: number) {
  for (let rowOffset = 0; rowOffset < rowSpan; rowOffset += 1) {
    for (let columnOffset = 0; columnOffset < columnSpan; columnOffset += 1) {
      occupied[row + rowOffset][column + columnOffset] = true;
    }
  }
}

function getGridPlacementRect(placement: GridPlacement, metrics: GridMetrics): MeasuredRect {
  const left = metrics.rect.left + placement.column * (metrics.columnWidth + metrics.columnGap);
  const top = metrics.rect.top + placement.row * (metrics.rowHeight + metrics.rowGap);
  const width = getGridItemWidth(placement.columnSpan, metrics);
  const height = placement.rowSpan * metrics.rowHeight + (placement.rowSpan - 1) * metrics.rowGap;
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height
  };
}

function getGridItemWidth(columnSpan: number, metrics: GridMetrics) {
  return columnSpan * metrics.columnWidth + (columnSpan - 1) * metrics.columnGap;
}

function getPointerToPlacementScore(pointer: Point, rect: MeasuredRect) {
  const outsideDistance = getDistanceToRect(pointer, rect);
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const centerDistance = Math.hypot(pointer.x - centerX, pointer.y - centerY);
  return outsideDistance * 6 + centerDistance * 0.2;
}

function getDragRectToPlacementScore(dragRect: MeasuredRect, placementRect: MeasuredRect) {
  const leftDistance = Math.abs(dragRect.left - placementRect.left);
  const topDistance = Math.abs(dragRect.top - placementRect.top);
  const centerDistance = Math.hypot(
    dragRect.left + dragRect.width / 2 - (placementRect.left + placementRect.width / 2),
    dragRect.top + dragRect.height / 2 - (placementRect.top + placementRect.height / 2)
  );
  const overlapArea = getRectIntersectionArea(dragRect, placementRect);
  const overlapRatio = overlapArea / Math.max(1, Math.min(dragRect.width * dragRect.height, placementRect.width * placementRect.height));
  return leftDistance * 3 + topDistance * 2 + centerDistance * 0.12 - overlapRatio * 120;
}

function findAdminSectionGridElement(sectionId: string, pointer?: Point | null, dragRect?: MeasuredRect | null) {
  const candidates = Array.from(document.querySelectorAll<HTMLElement>("[data-admin-section-grid-id]")).filter(
    (element) => element.dataset.adminSectionGridId === sectionId
  );
  if (candidates.length <= 1) return candidates[0] ?? null;

  const intentPoint = pointer ?? getDragCenterPoint(dragRect ?? null);
  if (!intentPoint) return candidates[0] ?? null;

  return candidates
    .map((element) => {
      const rect = element.getBoundingClientRect();
      return { element, score: getDistanceToRect(intentPoint, rect) };
    })
    .sort((a, b) => a.score - b.score)[0]?.element ?? null;
}

function findAdminContentGroupGridElement(contentGroupId: string) {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-admin-content-group-id]")).find(
    (element) => element.dataset.adminContentGroupId === contentGroupId
  ) ?? null;
}

function getAxisDistance(value: number, start: number, end: number) {
  if (value < start) return start - value;
  if (value > end) return value - end;
  return 0;
}

function getDistanceToRect(point: Point, rect: MeasuredRect) {
  return Math.hypot(getAxisDistance(point.x, rect.left, rect.right), getAxisDistance(point.y, rect.top, rect.bottom));
}

function getRectIntersectionArea(source: MeasuredRect, target: MeasuredRect) {
  const width = Math.max(0, Math.min(source.right, target.right) - Math.max(source.left, target.left));
  const height = Math.max(0, Math.min(source.bottom, target.bottom) - Math.max(source.top, target.top));
  return width * height;
}

function isPointInRect(point: Point, rect: RectLike & Pick<DOMRectReadOnly, "right" | "bottom">) {
  return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
}

function getInsertionIndexFromBlockRects(targetBlocks: Block[], pointer: Point) {
  if (targetBlocks.length === 0) return 0;

  const items = targetBlocks
    .map((block, index) => {
      const rect = getMeasuredAdminBlockRect(block.id);
      return rect ? { index, rect } : null;
    })
    .filter((item): item is { index: number; rect: MeasuredRect } => item !== null)
    .sort((a, b) => (Math.abs(a.rect.top - b.rect.top) > 8 ? a.rect.top - b.rect.top : a.rect.left - b.rect.left));

  if (items.length === 0) return targetBlocks.length;

  const rowThreshold = Math.max(24, Math.min(...items.map((item) => item.rect.height)) * 0.5);
  const rows: Array<Array<{ index: number; rect: MeasuredRect }>> = [];
  for (const item of items) {
    const row = rows.find((candidate) => Math.abs(candidate[0].rect.top - item.rect.top) <= rowThreshold);
    if (row) {
      row.push(item);
    } else {
      rows.push([item]);
    }
  }

  for (const row of rows) {
    row.sort((a, b) => a.rect.left - b.rect.left);
    const rowTop = Math.min(...row.map((item) => item.rect.top));
    const rowBottom = Math.max(...row.map((item) => item.rect.bottom));
    if (pointer.y < rowTop - rowThreshold * 0.6) {
      return row[0].index;
    }
    if (pointer.y <= rowBottom + rowThreshold * 0.6) {
      for (const item of row) {
        if (pointer.x < item.rect.left + item.rect.width / 2) {
          return item.index;
        }
      }
      return row[row.length - 1].index + 1;
    }
  }

  return targetBlocks.length;
}

function EditableSection({
  section,
  contentGroupId,
  blocks,
  device,
  onEditSection,
  onDeleteSection,
  onEditBlock,
  onDeleteBlock,
  onSelectBlock,
  activeDragBlockId,
  dragPreviewBlock,
  dragPreviewPlacement,
  onResizeBlock,
  onResizePreview,
  resizeDrafts,
  onResizeDraft,
  sectionHandleProps,
  sectionContainerProps,
  hideHeader = false,
  showDragPreview = false
}: {
  section: Section;
  contentGroupId?: string;
  blocks: Block[];
  device: LayoutDevice;
  onEditSection: () => void;
  onDeleteSection: () => void;
  onEditBlock: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
  onSelectBlock: (blockId: string) => void;
  activeDragBlockId: string | null;
  dragPreviewBlock: Block | null;
  dragPreviewPlacement: DragPreviewPlacement | null;
  onResizeBlock: (blockId: string, size: BlockSize) => void;
  onResizePreview: (size: BlockSize | null) => void;
  resizeDrafts: Record<string, BlockResizeDraft>;
  onResizeDraft: (blockId: string, draft: BlockResizeDraft | null) => void;
  sectionHandleProps: React.HTMLAttributes<HTMLButtonElement>;
  sectionContainerProps?: React.HTMLAttributes<HTMLDivElement> & { ref?: (node: HTMLDivElement | null) => void };
  hideHeader?: boolean;
  showDragPreview?: boolean;
}) {
  const droppableId = contentGroupId ? `content-group:${contentGroupId}` : `section:${section.id}`;
  const { setNodeRef } = useDroppable({ id: droppableId });
  const previewIndex =
    showDragPreview && dragPreviewBlock && dragPreviewPlacement?.targetSectionId === section.id
      ? Math.max(0, Math.min(dragPreviewPlacement.targetIndex, blocks.filter((block) => block.id !== activeDragBlockId).length))
      : null;
  const shouldRenderDropPreview = previewIndex !== null && dragPreviewBlock !== null;
  const gridItems: Array<{ type: "block"; block: Block } | { type: "preview"; block: Block; placement?: BlockPlacementDraft }> = [];
  blocks
    .filter((block) => !(shouldRenderDropPreview && block.id === activeDragBlockId))
    .forEach((block, index) => {
      if (shouldRenderDropPreview && previewIndex === index && dragPreviewBlock) {
        gridItems.push({
          type: "preview",
          block: dragPreviewBlock,
          placement: { columnStart: dragPreviewPlacement?.columnStart, rowStart: dragPreviewPlacement?.rowStart }
        });
      }
      gridItems.push({ type: "block", block });
    });
  if (shouldRenderDropPreview && previewIndex === gridItems.filter((item) => item.type === "block").length && dragPreviewBlock) {
    gridItems.push({
      type: "preview",
      block: dragPreviewBlock,
      placement: { columnStart: dragPreviewPlacement?.columnStart, rowStart: dragPreviewPlacement?.rowStart }
    });
  }
  const compactedGridStyles = getCompactedBlockGridStyles(
    gridItems.map((item) => {
      const resizeDraft = item.type === "block" ? resizeDrafts[item.block.id] : undefined;
      const resizedBlock = resizeDraft
        ? { ...item.block, responsiveSizes: { ...item.block.responsiveSizes, [device]: resizeDraft.size } }
        : item.block;
      const block =
        item.type === "preview" && item.placement
          ? { ...resizedBlock, placements: { ...resizedBlock.placements, [device]: item.placement } }
          : shouldRenderDropPreview
            ? withoutBlockPlacementForDevice(resizedBlock, device)
            : resizedBlock;
      return {
        id: item.type === "preview" ? blockDropPreviewId : item.block.id,
        block
      };
    }),
    device
  );
  const shouldShowBlockGrid = hideHeader || blocks.length > 0 || shouldRenderDropPreview;
  return (
    <section
      ref={setNodeRef}
      data-admin-section-id={section.id}
      data-admin-droppable-id={droppableId}
      className="admin-grid-container grid gap-6 rounded-[24px] p-2 transition"
    >
      {hideHeader ? null : (
        <div
          {...sectionContainerProps}
          data-admin-section-heading-id={section.id}
          className={cn("group relative flex items-center justify-between gap-3", sectionContainerProps?.className)}
        >
          <div className="min-w-0">
            <button
              type="button"
              className={cn(
                "admin-draggable absolute top-1 grid h-9 w-9 cursor-grab place-items-center rounded-full bg-white text-[#9CA3AF] shadow-soft transition active:cursor-grabbing",
                device === "mobile" ? "-left-2 opacity-100" : "-left-11 opacity-0 group-hover:opacity-100"
              )}
              {...sectionHandleProps}
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <button type="button" onClick={onEditSection} className="min-w-0 rounded-xl px-1 text-left">
              <h2 className="text-2xl font-bold tracking-normal">
                {section.title}
                {section.emoji ? <span className="ml-1 text-[#1479FF]">{section.emoji}</span> : null}
              </h2>
              {section.description ? <p className="mt-1 text-sm text-[#64748B]">{section.description}</p> : null}
            </button>
          </div>
          <div className={cn("flex gap-1 transition", device === "mobile" ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
            <button type="button" onClick={onDeleteSection} className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-soft">
              <Trash2 className="h-4 w-4 text-red-500" />
            </button>
            <button type="button" onClick={onEditSection} className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-soft">
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      {shouldShowBlockGrid ? (
        <SortableContext items={blocks.map((block) => block.id)} strategy={rectSortingStrategy}>
          <div
            className={cn("relative", blockGridClassByDevice[device])}
            data-device={device}
            data-admin-section-grid-id={section.id}
            data-admin-content-group-id={contentGroupId}
            style={{ gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gridAutoFlow: "dense" }}
          >
            {shouldRenderDropPreview && dragPreviewBlock ? (
              <BlockDropPreview
                block={dragPreviewBlock}
                device={device}
                placement={{ columnStart: dragPreviewPlacement?.columnStart, rowStart: dragPreviewPlacement?.rowStart }}
                layoutStyle={compactedGridStyles.get(blockDropPreviewId)}
              />
            ) : null}
            {blocks.map((block) => (
              <SortableBlock
                key={block.id}
                block={block}
                displaySize={resizeDrafts[block.id]?.size ?? getBlockSize(block, device)}
                device={device}
                layoutStyle={compactedGridStyles.get(block.id)}
                isDragOverlayActive={activeDragBlockId === block.id}
                disableSortableTransform={activeDragBlockId !== null}
                hideOriginalDuringDrag={false}
                removeFromFlowDuringDrag={shouldRenderDropPreview && activeDragBlockId === block.id}
                onEdit={() => onEditBlock(block.id)}
                onDelete={() => onDeleteBlock(block.id)}
                onSelect={() => onSelectBlock(block.id)}
                onResize={(size) => onResizeBlock(block.id, size)}
                onResizePreview={onResizePreview}
                onResizeDraft={(size) => onResizeDraft(block.id, size)}
              />
            ))}
          </div>
        </SortableContext>
      ) : null}
    </section>
  );
}

function StandaloneBlockDropPreview({
  block,
  device,
  placement
}: {
  block: Block;
  device: LayoutDevice;
  placement?: BlockPlacementDraft;
}) {
  return (
    <section className="admin-grid-container grid gap-6 rounded-[24px] p-2 transition">
      <div
        className={cn("relative", blockGridClassByDevice[device])}
        data-device={device}
        style={{ gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gridAutoFlow: "dense" }}
      >
        <BlockDropPreview block={block} device={device} placement={placement} />
      </div>
    </section>
  );
}

function BlockDropPreview({
  block,
  device,
  placement,
  layoutStyle
}: {
  block: Block;
  device: LayoutDevice;
  placement?: BlockPlacementDraft;
  layoutStyle?: React.CSSProperties;
}) {
  const displaySize = getBlockSize(block, device);
  const gridSpan = getDefaultGridSpan(displaySize, device);
  const rowSpan = getDefaultRowSpan(displaySize);
  const previewBlock = placement ? { ...block, placements: { ...block.placements, [device]: placement } } : block;
  const placementStyle = {
    ...getAdminBlockGridStyle(previewBlock, device, displaySize),
    ...layoutStyle,
    gridColumnEnd: `span ${gridSpan}`,
    gridRowEnd: `span ${rowSpan}`
  };
  return (
    <div
      style={placementStyle}
      className={cn(
        "pointer-events-none rounded-[20px] border-2 border-dashed border-[#1479FF]/55 bg-[#EDF6FF]/75 shadow-[inset_0_0_0_1px_rgba(20,121,255,0.12)]",
        blockSizeClassByDevice[device][displaySize]
      )}
    >
      <div className="grid h-full w-full place-items-center rounded-[18px] bg-white/35 text-xs font-semibold text-[#1479FF]">
        放到这里
      </div>
    </div>
  );
}

function TextBlockDropPreview({ block }: { block: Block }) {
  return (
    <div className="pointer-events-none rounded-[20px] border-2 border-dashed border-[#1479FF]/45 bg-[#EDF6FF]/65 px-2 py-2">
      <BlockCard block={block} disableActions withLayout={false} className="min-h-0 opacity-50" />
    </div>
  );
}

function withoutBlockPlacementForDevice(block: Block, device: LayoutDevice): Block {
  if (!block.placements?.[device]) return block;

  const placements = { ...block.placements };
  delete placements[device];
  return { ...block, placements };
}

function SortableTextBlock({
  block,
  device,
  isDragOverlayActive,
  disableSortableTransform,
  removeFromFlowDuringDrag,
  onEdit,
  onDelete,
  onSelect
}: {
  block: Block;
  device: LayoutDevice;
  isDragOverlayActive: boolean;
  disableSortableTransform: boolean;
  removeFromFlowDuringDrag: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const visualTransform = disableSortableTransform || isDragOverlayActive ? undefined : CSS.Translate.toString(transform);
  const visualTransition = disableSortableTransform ? undefined : transition;
  const removeFromFlowStyle: React.CSSProperties | undefined = removeFromFlowDuringDrag
    ? { position: "absolute", opacity: 0, pointerEvents: "none" }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      data-admin-block="true"
      data-admin-block-id={block.id}
      style={{ transform: visualTransform, transition: visualTransition, ...removeFromFlowStyle }}
      className={cn(
        "admin-draggable group relative cursor-grab rounded-[20px] px-0 py-1 transition-all duration-200 ease-out active:cursor-grabbing",
        isDragging || isDragOverlayActive ? "z-20 opacity-20" : ""
      )}
      onClick={onSelect}
      {...attributes}
      {...listeners}
    >
      <BlockCard
        block={block}
        disableActions
        withLayout={false}
        className="min-h-0 rounded-[20px] transition group-hover:bg-[#F3F4F6]"
      />
      <div className={cn("pointer-events-none absolute inset-0 z-50 transition", device === "mobile" ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          className="pointer-events-auto absolute -left-3 -top-3 grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition hover:border-red-100 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </button>
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onEdit();
          }}
          className="pointer-events-auto absolute -right-3 -top-3 grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition hover:border-[#D8E9FF] hover:bg-[#F2F8FF]"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function SortableBlock({
  block,
  displaySize,
  device,
  layoutStyle,
  isDragOverlayActive,
  disableSortableTransform,
  hideOriginalDuringDrag,
  removeFromFlowDuringDrag,
  onEdit,
  onDelete,
  onSelect,
  onResize,
  onResizePreview,
  onResizeDraft
}: {
  block: Block;
  displaySize: BlockSize;
  device: LayoutDevice;
  layoutStyle?: React.CSSProperties;
  isDragOverlayActive: boolean;
  disableSortableTransform: boolean;
  hideOriginalDuringDrag: boolean;
  removeFromFlowDuringDrag: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSelect: () => void;
  onResize: (size: BlockSize) => void;
  onResizePreview: (size: BlockSize | null) => void;
  onResizeDraft: (draft: BlockResizeDraft | null) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const blockNodeRef = useRef<HTMLDivElement | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [localResizeDraft, setLocalResizeDraft] = useState<BlockResizeDraft | null>(null);
  const activeDisplaySize = localResizeDraft?.size ?? displaySize;
  const activeGridSpan = localResizeDraft?.gridSpan ?? getDefaultGridSpan(activeDisplaySize, device);
  const activeRowSpan = localResizeDraft?.rowSpan ?? getDefaultRowSpan(activeDisplaySize);
  const setBlockNodeRef = useCallback(
    (node: HTMLDivElement | null) => {
      blockNodeRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef]
  );
  const resizeStyle = {
    ...getAdminBlockGridStyle(block, device, activeDisplaySize),
    ...layoutStyle,
    gridColumnEnd: `span ${activeGridSpan}`,
    gridRowEnd: `span ${activeRowSpan}`
  };
  const visualTransform =
    disableSortableTransform || isDragOverlayActive || removeFromFlowDuringDrag ? undefined : CSS.Translate.toString(transform);
  const visualTransition = disableSortableTransform ? undefined : transition;

  function startResize(event: React.PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    event.nativeEvent.stopImmediatePropagation();
    onSelect();
    setIsResizing(true);
    onResizePreview(activeDisplaySize);
    const metrics = getResizeMetrics(event.currentTarget, device);
    const initialDraft = metrics
      ? {
          size: activeDisplaySize,
          gridSpan: getDefaultGridSpan(activeDisplaySize, device),
          rowSpan: getDefaultRowSpan(activeDisplaySize)
        }
      : null;
    if (initialDraft) {
      setLocalResizeDraft(initialDraft);
      onResizeDraft(initialDraft);
    }
    const initialSize = activeDisplaySize;
    let lastDraft: BlockResizeDraft | null = initialDraft;

    function updateSize(moveEvent: PointerEvent) {
      moveEvent.preventDefault();
      if (!metrics) return;

      const nextDraft = getPointerResizeDraft(moveEvent, metrics, device);
      if (
        !lastDraft ||
        nextDraft.size !== lastDraft.size ||
        nextDraft.gridSpan !== lastDraft.gridSpan ||
        nextDraft.rowSpan !== lastDraft.rowSpan
      ) {
        const gridElement = blockNodeRef.current?.parentElement instanceof HTMLElement ? blockNodeRef.current.parentElement : null;
        const previousLayout = captureAdminBlockLayout(gridElement);
        lastDraft = nextDraft;
        flushSync(() => {
          setLocalResizeDraft(nextDraft);
          onResizeDraft(nextDraft);
          onResizePreview(nextDraft.size);
        });
        animateAdminBlockLayout(gridElement, previousLayout, block.id);
      }
    }

    function stopResize() {
      window.removeEventListener("pointermove", updateSize);
      window.removeEventListener("pointerup", stopResize);
      window.removeEventListener("pointercancel", stopResize);
      if (lastDraft && lastDraft.size !== initialSize) {
        onResize(lastDraft.size);
      }
      window.setTimeout(() => {
        setLocalResizeDraft(null);
        onResizeDraft(null);
        setIsResizing(false);
        onResizePreview(null);
      }, 140);
    }

    window.addEventListener("pointermove", updateSize);
    window.addEventListener("pointerup", stopResize);
    window.addEventListener("pointercancel", stopResize);
  }

  return (
    <div
      ref={setBlockNodeRef}
      data-admin-block="true"
      data-admin-block-id={block.id}
      style={{ transform: visualTransform, transition: visualTransition, ...resizeStyle }}
      className={cn(
        "admin-draggable group relative cursor-grab will-change-transform active:cursor-grabbing transition-all duration-200 ease-out",
        blockSizeClassByDevice[device][activeDisplaySize],
        removeFromFlowDuringDrag ? "absolute left-0 top-0 z-20 h-px w-px overflow-hidden opacity-0" : "",
        hideOriginalDuringDrag ? "opacity-0" : isDragging || isDragOverlayActive ? "z-20 opacity-20" : "",
        isResizing ? "z-30" : ""
      )}
      onClick={onSelect}
      {...attributes}
      {...listeners}
    >
      <div data-admin-block-surface="true" className="h-full w-full overflow-hidden rounded-[20px]">
        <BlockCard block={block} disableActions withLayout={false} className="h-full w-full select-none ring-0 group-hover:ring-2 group-hover:ring-[#1479FF]/20" />
      </div>
      <div className={cn("pointer-events-none absolute inset-0 z-50 transition", device === "mobile" ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          className="pointer-events-auto absolute -left-3 -top-3 grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition hover:border-red-100 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </button>
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onEdit();
          }}
          className="pointer-events-auto absolute -right-3 -top-3 grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition hover:border-[#D8E9FF] hover:bg-[#F2F8FF]"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </div>
      <button
        type="button"
        title="拖动调整大小"
        onPointerDown={startResize}
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
        className="absolute -bottom-1 -right-1 z-40 grid h-12 w-12 touch-none cursor-nwse-resize place-items-center rounded-br-[20px] rounded-tl-[22px] bg-black text-white opacity-0 shadow-[0_10px_28px_rgba(0,0,0,0.22)] transition group-hover:opacity-100"
      >
        <span className="grid h-7 w-7 place-items-end">
          <span className="h-4 w-4 rounded-br-lg border-b-[3px] border-r-[3px] border-current" />
        </span>
      </button>
    </div>
  );
}

type AdminBlockLayoutSnapshot = {
  rect: DOMRectReadOnly;
  surfaceRect: DOMRectReadOnly | null;
};

function captureAdminBlockLayout(gridElement: HTMLElement | null) {
  const layout = new Map<string, AdminBlockLayoutSnapshot>();
  if (!gridElement) return layout;

  gridElement.querySelectorAll<HTMLElement>("[data-admin-block-id]").forEach((element) => {
    const blockId = element.dataset.adminBlockId;
    if (!blockId) return;
    const surface = element.querySelector<HTMLElement>("[data-admin-block-surface='true']");
    layout.set(blockId, {
      rect: element.getBoundingClientRect(),
      surfaceRect: surface ? surface.getBoundingClientRect() : null
    });
  });

  return layout;
}

function cancelAdminBlockLayoutAnimations() {
  document.querySelectorAll<HTMLElement>("[data-admin-block-id], [data-admin-block-surface='true']").forEach((element) => {
    element.getAnimations().forEach((animation) => {
      if (animation.id === "admin-block-resize-layout" || animation.id === "admin-block-resize-surface") {
        animation.cancel();
      }
    });
  });
}

function animateAdminBlockLayout(gridElement: HTMLElement | null, previousLayout: Map<string, AdminBlockLayoutSnapshot>, activeBlockId: string) {
  if (!gridElement || previousLayout.size === 0) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  gridElement.querySelectorAll<HTMLElement>("[data-admin-block-id]").forEach((element) => {
    const blockId = element.dataset.adminBlockId;
    const before = blockId ? previousLayout.get(blockId) : null;
    if (!blockId || !before) return;

    const after = element.getBoundingClientRect();
    const deltaX = before.rect.left - after.left;
    const deltaY = before.rect.top - after.top;
    const hasPositionChange = Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5;

    if (hasPositionChange) {
      element.getAnimations().forEach((animation) => {
        if (animation.id === "admin-block-resize-layout") {
          animation.cancel();
        }
      });

      const animation = element.animate(
        [
          {
            transform: `translate(${deltaX}px, ${deltaY}px)`,
            transformOrigin: "top left"
          },
          {
            transform: "translate(0, 0)",
            transformOrigin: "top left"
          }
        ],
        {
          duration: 220,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)"
        }
      );
      animation.id = "admin-block-resize-layout";
    }

    if (blockId !== activeBlockId) return;

    const surface = element.querySelector<HTMLElement>("[data-admin-block-surface='true']");
    if (!surface || !before.surfaceRect) return;

    const surfaceAfter = surface.getBoundingClientRect();
    const hasSizeChange = Math.abs(before.surfaceRect.width - surfaceAfter.width) > 0.5 || Math.abs(before.surfaceRect.height - surfaceAfter.height) > 0.5;

    if (!hasSizeChange) return;

    surface.getAnimations().forEach((animation) => {
      if (animation.id === "admin-block-resize-surface") {
        animation.cancel();
      }
    });

    const surfaceAnimation = surface.animate(
      [
        {
          width: `${before.surfaceRect.width}px`,
          height: `${before.surfaceRect.height}px`
        },
        {
          width: `${surfaceAfter.width}px`,
          height: `${surfaceAfter.height}px`
        }
      ],
      {
        duration: 220,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)"
      }
    );
    surfaceAnimation.id = "admin-block-resize-surface";
  });
}

function getResizeMetrics(handle: HTMLElement, device: LayoutDevice): ResizeMetrics | null {
  const blockElement = handle.closest("[data-admin-block='true']");
  const gridElement = blockElement?.parentElement;
  if (!(blockElement instanceof HTMLElement) || !(gridElement instanceof HTMLElement)) {
    return null;
  }

  const columns = 12;
  const minSpan = device === "desktop" ? 4 : 6;
  const blockRect = blockElement.getBoundingClientRect();
  const gridRect = gridElement.getBoundingClientRect();
  const gridScale = gridElement.offsetWidth > 0 ? gridRect.width / gridElement.offsetWidth : 1;
  const styles = window.getComputedStyle(gridElement);
  const rawGap = Number.parseFloat(styles.columnGap || styles.gap || "16");
  const gap = Number.isFinite(rawGap) ? rawGap * gridScale : 16 * gridScale;
  const columnWidth = (gridRect.width - gap * (columns - 1)) / columns;
  const cellSize = columnWidth * minSpan + gap * (minSpan - 1);

  return {
    left: blockRect.left,
    top: blockRect.top,
    columnWidth,
    gap,
    columns,
    minSpan,
    cellSize
  };
}

function getPointerResizeDraft(event: PointerEvent, metrics: ResizeMetrics, device: LayoutDevice): BlockResizeDraft {
  const rawWidth = Math.max(metrics.columnWidth * metrics.minSpan, event.clientX - metrics.left);
  const rawHeight = Math.max(metrics.cellSize * 0.75, event.clientY - metrics.top);
  const logicalColumnUnit = metrics.cellSize + metrics.gap;
  const logicalCols = clamp(Math.round((rawWidth + metrics.gap) / logicalColumnUnit), 1, device === "desktop" ? 3 : 2);
  const logicalRows = clamp(Math.round((rawHeight + metrics.gap) / logicalColumnUnit), 1, 2);
  const size = getPresetFromDraft({ logicalCols, logicalRows, device });

  return {
    size,
    gridSpan: getDefaultGridSpan(size, device),
    rowSpan: getDefaultRowSpan(size)
  };
}

function getPresetFromDraft({
  logicalCols,
  logicalRows,
  device
}: {
  logicalCols: number;
  logicalRows: number;
  device: LayoutDevice;
}): BlockSize {
  if (logicalCols <= 1) {
    return logicalRows >= 2 ? "tall" : "small-square";
  }

  if (device === "mobile") {
    return logicalRows >= 2 ? "large-square" : "wide";
  }

  if (logicalCols === 2) {
    return logicalRows >= 2 ? "large-square" : "wide";
  }

  return "full-wide";
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function FloatingToolbar({
  device,
  canEditDesktop,
  onDeviceChange,
  onAddBlock,
  onAddSection
}: {
  device: LayoutDevice;
  canEditDesktop: boolean;
  onDeviceChange: (device: LayoutDevice) => void;
  onAddBlock: () => void;
  onAddSection: () => void;
}) {
  return (
    <div className="fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-[24px] border border-[#EAF0F8] bg-white/95 p-2 shadow-[0_18px_60px_rgba(15,23,42,0.18)] backdrop-blur">
      <div className="flex rounded-[18px] bg-[#F1F5F9] p-1">
        <button
          type="button"
          disabled={!canEditDesktop}
          onClick={() => onDeviceChange("desktop")}
          className={`grid h-10 w-10 place-items-center rounded-[14px] transition ${
            device === "desktop"
              ? "bg-black text-white shadow-soft"
              : canEditDesktop
                ? "text-[#64748B] hover:bg-white"
                : "cursor-not-allowed text-[#CBD5E1]"
          }`}
          title={canEditDesktop ? "桌面端" : "手机设备只能编辑移动端"}
        >
          <Laptop className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDeviceChange("mobile")}
          className={`grid h-10 w-10 place-items-center rounded-[14px] transition ${
            device === "mobile" ? "bg-black text-white shadow-soft" : "text-[#64748B] hover:bg-white"
          }`}
          title="移动端"
        >
          <Smartphone className="h-4 w-4" />
        </button>
      </div>
      <Button onClick={onAddBlock}>
        <Plus className="h-4 w-4" />
        添加 Block
      </Button>
      <Button variant="secondary" size="icon" onClick={onAddSection} title="添加 Section">
        <AlignLeft className="h-4 w-4" />
      </Button>
    </div>
  );
}

function ResizePreview({ activeSize }: { activeSize: BlockSize }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-4 rounded-[28px] border border-[#EAF0F8] bg-white/96 px-6 py-3 shadow-[0_18px_60px_rgba(15,23,42,0.18)] backdrop-blur">
      {blockSizePresets.map((preset) => (
        <div
          key={preset.size}
          title={preset.label}
          className={`grid h-11 w-11 place-items-center rounded-xl border transition [&>span>svg]:h-6 [&>span>svg]:w-6 ${
            activeSize === preset.size
              ? "border-[#1479FF] bg-[#1479FF] text-white"
              : "border-transparent bg-white text-[#9CA3AF]"
          }`}
        >
          <span>{preset.icon}</span>
        </div>
      ))}
    </div>
  );
}

function EditorModal({
  title,
  children,
  onClose,
  onSave,
  isSaving,
  tone = "light",
  footerStart
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
  tone?: "light" | "dark";
  footerStart?: React.ReactNode;
}) {
  const isDark = tone === "dark";
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div
        className={cn(
          "flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-[18px] shadow-2xl",
          isDark ? "bg-[#1C1C1C] text-white" : "bg-white text-[#111]"
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={cn("flex items-center justify-between border-b px-5 py-4", isDark ? "border-white/10" : "border-[#EEF2F7]")}>
          <h3 className="text-base font-bold">{title}</h3>
          <button type="button" onClick={onClose} className={cn("grid h-8 w-8 place-items-center rounded-full", isDark ? "hover:bg-white/10" : "hover:bg-[#F1F5F9]")}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-auto p-5">{children}</div>
        <div className={cn("flex items-center justify-between gap-3 border-t px-5 py-4", isDark ? "border-white/10" : "border-[#EEF2F7]")}>
          <div>{footerStart}</div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose} className={cn(isDark && "text-white hover:bg-white/10")}>取消</Button>
            <Button
              onClick={async () => {
                await onSave();
                onClose();
              }}
              disabled={isSaving}
              className={cn(isDark ? "rounded-full bg-white text-black hover:bg-white/90" : "bg-black hover:bg-black/90")}
            >
              {isSaving ? "保存中" : "保存"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TagsQuickForm({ profile, onPatch }: { profile: Profile; onPatch: (patch: Partial<Profile>) => void }) {
  function updateTag(index: number, value: string) {
    onPatch({ tags: profile.tags.map((tag, itemIndex) => (itemIndex === index ? value : tag)) });
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#64748B]">编辑个人页标签，拖拽排序先不放这里，使用上下按钮更稳。</p>
        <Button type="button" variant="secondary" size="sm" onClick={() => onPatch({ tags: [...profile.tags, "New Tag"] })}>
          <Plus className="h-4 w-4" />
          添加/add
        </Button>
      </div>
      <div className="grid gap-2">
        {profile.tags.map((tag, index) => (
          <div key={`${tag}-${index}`} className="grid gap-2 rounded-2xl border border-[#EAEAEA] p-3 sm:grid-cols-[1fr_auto]">
            <Input value={tag} onChange={(event) => updateTag(index, event.target.value)} />
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onPatch({ tags: moveItem(profile.tags, index, Math.max(0, index - 1)) })}
              >
                ↑
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onPatch({ tags: moveItem(profile.tags, index, Math.min(profile.tags.length - 1, index + 1)) })}
              >
                ↓
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => onPatch({ tags: profile.tags.filter((_, itemIndex) => itemIndex !== index) })}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SocialLinksQuickForm({ profile, onPatch }: { profile: Profile; onPatch: (patch: Partial<Profile>) => void }) {
  const orderedLinks = [...profile.socialLinks].sort(bySortOrder);
  const [expandedLinkId, setExpandedLinkId] = useState<string | null>(orderedLinks[0]?.id ?? null);

  function patchLinks(links: SocialLink[]) {
    onPatch({ socialLinks: normalizeSortOrder(links) });
  }

  function updateSocial(linkId: string, patch: Partial<SocialLink>) {
    patchLinks(orderedLinks.map((link) => (link.id === linkId ? { ...link, ...patch } : link)));
  }

  function patchHref(link: SocialLink, href: string) {
    updateSocial(link.id, { href, icon: inferSocialIconFromUrl(href, link.icon), label: link.label || inferSocialLabelFromUrl(href) });
  }

  return (
    <div className="grid gap-5 text-[#333]">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#64748B]">社交按钮会显示在 tags 下方，可以设置跳转或复制内容。</p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            const newLink: SocialLink = {
              id: crypto.randomUUID(),
                label: "New Link",
                icon: "link",
                href: "https://",
                actionType: "link",
                openInNewTab: true,
                isVisible: true,
                sortOrder: orderedLinks.length + 1
            };
            patchLinks([...orderedLinks, newLink]);
            setExpandedLinkId(newLink.id);
          }}
        >
          <Plus className="h-4 w-4" />
          添加/add
        </Button>
      </div>
      <div className="grid gap-3">
        {orderedLinks.map((link, index) => {
          const isExpanded = expandedLinkId === link.id;
          return (
            <div key={link.id} className="grid gap-3 rounded-[18px] border border-[#EAEAEA] bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setExpandedLinkId(isExpanded ? null : link.id)}
                  className="inline-flex min-w-0 flex-1 items-center gap-2 rounded-xl text-left"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#F1F5F9] text-[#1479FF]">
                    <SocialIcon name={link.icon} />
                  </span>
                  <span className="grid min-w-0 gap-0.5">
                    <span className="truncate text-sm font-semibold text-[#111]">{link.label || "New Link"}</span>
                    <span className="truncate text-xs text-[#64748B]">{link.href || link.actionType || "link"}</span>
                  </span>
                  <ChevronDown className={cn("ml-auto h-4 w-4 shrink-0 text-[#94A3B8] transition", isExpanded && "rotate-180")} />
                </button>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="sm" disabled={index === 0} onClick={() => patchLinks(moveItem(orderedLinks, index, Math.max(0, index - 1)))}>
                  ↑
                </Button>
                <Button type="button" variant="ghost" size="sm" disabled={index === orderedLinks.length - 1} onClick={() => patchLinks(moveItem(orderedLinks, index, Math.min(orderedLinks.length - 1, index + 1)))}>
                  ↓
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => patchLinks(orderedLinks.filter((item) => item.id !== link.id))}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
              {isExpanded ? (
                <div className="grid gap-3 border-t border-[#EEF2F7] pt-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="名称/label">
                      <Input value={link.label} onChange={(event) => updateSocial(link.id, { label: event.target.value })} />
                    </Field>
                    <Field label="类型/type">
                      <Select value={link.actionType ?? "link"} onChange={(event) => updateSocial(link.id, { actionType: event.target.value as SocialLink["actionType"] })}>
                        <option value="link">前往链接/link</option>
                        <option value="copy">复制内容/copy</option>
                      </Select>
                    </Field>
                    <Field label="链接/link" className="md:col-span-2">
                      <Input value={link.href} onChange={(event) => patchHref(link, event.target.value)} />
                    </Field>
                    {link.actionType === "copy" ? (
                      <Field label="复制内容/copy text" className="md:col-span-2">
                        <Input value={link.copyText ?? ""} onChange={(event) => updateSocial(link.id, { copyText: event.target.value })} />
                      </Field>
                    ) : null}
                  </div>
                  <Field label="图标/icon">
                    <div className="flex flex-wrap gap-2 rounded-[18px] border border-[#EAEAEA] bg-[#FAFAFA] p-2" onClick={(event) => event.stopPropagation()}>
                      {socialIconPresets.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          aria-pressed={link.icon === icon}
                          onClick={(event) => {
                            event.stopPropagation();
                            updateSocial(link.id, { icon });
                          }}
                          className={cn(
                            "inline-grid min-h-10 grid-cols-[16px_auto] items-center gap-1.5 rounded-full border px-3 text-sm transition",
                            link.icon === icon
                              ? "border-[#1479FF] bg-[#1479FF] text-white"
                              : "border-[#EAEAEA] bg-white text-[#475569] hover:border-[#1479FF]/40"
                          )}
                        >
                          <SocialIcon name={icon} />
                          <span>{icon}</span>
                        </button>
                      ))}
                    </div>
                  </Field>
                  <div className="flex flex-wrap gap-4 text-sm text-[#475569]">
                    <label className="flex items-center gap-2">
                      <Checkbox checked={link.isVisible} onChange={(event) => updateSocial(link.id, { isVisible: event.target.checked })} />
                      显示/visible
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox checked={link.openInNewTab ?? true} onChange={(event) => updateSocial(link.id, { openInNewTab: event.target.checked })} />
                      新窗口/open tab
                    </label>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProfileQuickForm({ profile, onPatch }: { profile: Profile; onPatch: (patch: Partial<Profile>) => void }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="头像 URL">
          <Input value={profile.avatarUrl} onChange={(event) => onPatch({ avatarUrl: event.target.value })} />
        </Field>
        <Field label="名称">
          <Input value={profile.displayName} onChange={(event) => onPatch({ displayName: event.target.value })} />
        </Field>
        <Field label="Headline">
          <Input value={profile.headline} onChange={(event) => onPatch({ headline: event.target.value })} />
        </Field>
        <Field label="位置">
          <Input value={profile.location ?? ""} onChange={(event) => onPatch({ location: event.target.value })} />
        </Field>
      </div>
      <Field label="简介">
        <Textarea value={profile.bio} onChange={(event) => onPatch({ bio: event.target.value })} />
      </Field>
      <Field label="Tags，用逗号分隔">
        <Input value={profile.tags.join(", ")} onChange={(event) => onPatch({ tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) })} />
      </Field>
      <MediaUploader folder="avatar" onUploaded={(url) => onPatch({ avatarUrl: url })} />
    </div>
  );
}

function BlockModalBody({
  block,
  onPatch
}: {
  block?: Block;
  onPatch: (patch: Partial<Block>) => void;
}) {
  if (!block) return null;
  return <BlockForm block={block} onPatch={onPatch} />;
}

function AddBlockDialog({ onAdd }: { onAdd: (template: (typeof blockTemplates)[number]["items"][number]) => void }) {
  return (
    <div className="grid gap-5">
      <div className="rounded-xl bg-[#F3F5F9] px-4 py-3 text-sm text-[#7A8190]">
        不用太有压力，就像书摘一样，只添加你觉得最酷的事儿。
      </div>
      {blockTemplates.map((group) => (
        <section key={group.group} className="grid gap-3">
          <h4 className="font-bold">{group.group}</h4>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
            {group.items.map((item) => (
              <button key={`${group.group}-${item.label}`} type="button" onClick={() => onAdd(item)} className="grid justify-items-center gap-2 rounded-2xl p-3 text-center hover:bg-[#F8FBFF]">
                <span className="grid h-12 w-12 place-items-center rounded-xl border border-[#EAF0F8] bg-white text-[#1479FF] [&>svg]:h-6 [&>svg]:w-6">
                  {item.icon}
                </span>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ProjectSettingsForm({
  config,
  onChange,
  onExport,
  onImport
}: {
  config: SiteConfig;
  onChange: (config: SiteConfig) => void;
  onExport: () => void;
  onImport: (file: File) => Promise<void>;
}) {
  const theme = config.theme;
  const settings = config.settings;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function patchTheme(patch: Partial<SiteConfig["theme"]>) {
    onChange({ ...config, theme: { ...theme, ...patch } });
  }

  function patchSettings(patch: Partial<SiteConfig["settings"]>) {
    onChange({ ...config, settings: { ...settings, ...patch } });
  }

  return (
    <div className="grid gap-6 text-[#333]">
      <section className="grid gap-3">
        <h4 className="text-sm font-bold text-[#111]">项目</h4>
        <Field label="项目名称/project name">
          <Input value={settings.projectName} onChange={(event) => patchSettings({ projectName: event.target.value })} />
        </Field>
      </section>

      <section className="grid gap-3">
        <h4 className="text-sm font-bold text-[#111]">网页</h4>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="网页标题/site title">
            <Input value={settings.siteTitle} onChange={(event) => patchSettings({ siteTitle: event.target.value })} />
          </Field>
          <Field label="公开站点 URL/public URL">
            <Input
              value={settings.siteUrl}
              placeholder="https://example.com"
              onChange={(event) => patchSettings({ siteUrl: event.target.value })}
            />
          </Field>
          <Field label="网页描述/site description" className="md:col-span-2">
            <Textarea
              value={settings.siteDescription}
              onChange={(event) => patchSettings({ siteDescription: event.target.value })}
              className="min-h-24"
            />
          </Field>
        </div>
      </section>

      <section className="grid gap-3">
        <h4 className="text-sm font-bold text-[#111]">外观</h4>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="主色">
            <Input type="color" value={theme.primaryColor} onChange={(event) => patchTheme({ primaryColor: event.target.value })} />
          </Field>
          <Field label="背景">
            <Input type="color" value={theme.backgroundColor} onChange={(event) => patchTheme({ backgroundColor: event.target.value })} />
          </Field>
          <Field label="卡片背景">
            <Input type="color" value={theme.cardBackground} onChange={(event) => patchTheme({ cardBackground: event.target.value })} />
          </Field>
          <Field label="文字">
            <Input type="color" value={theme.textColor} onChange={(event) => patchTheme({ textColor: event.target.value })} />
          </Field>
          <Field label="边框">
            <Input type="color" value={theme.borderColor} onChange={(event) => patchTheme({ borderColor: event.target.value })} />
          </Field>
          <Field label="字体">
            <Select value={theme.fontFamily} onChange={(event) => patchTheme({ fontFamily: event.target.value as SiteConfig["theme"]["fontFamily"] })}>
              <option value="system">system</option>
              <option value="rounded">rounded</option>
              <option value="mono">mono</option>
            </Select>
          </Field>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-[#475569]">
          <label className="flex items-center gap-2">
            <Checkbox checked={settings.enableAnimation} onChange={(event) => patchSettings({ enableAnimation: event.target.checked })} />
            动画/animation
          </label>
          <label className="flex items-center gap-2">
            <Checkbox checked={settings.enableImagePreview} onChange={(event) => patchSettings({ enableImagePreview: event.target.checked })} />
            图片预览/image preview
          </label>
          <label className="flex items-center gap-2">
            <Checkbox checked={settings.enablePublicShare} onChange={(event) => patchSettings({ enablePublicShare: event.target.checked })} />
            公开分享/public share
          </label>
        </div>
      </section>

      <section className="grid gap-3 rounded-[18px] border border-[#EAEAEA] bg-[#FAFAFA] p-4">
        <div>
          <h4 className="text-sm font-bold text-[#111]">配置</h4>
          <p className="mt-1 text-sm text-[#64748B]">导入会覆盖当前编辑器里的草稿，确认后还需要点击保存才会发布。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onExport}>
            <Download className="h-4 w-4" />
            导出配置
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" />
            导入覆盖
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              try {
                await onImport(file);
              } catch {
                toast.error("导入失败", { description: "请选择有效的 JSON 配置文件。" });
              }
            }}
          />
        </div>
      </section>
    </div>
  );
}

function normalizeBlocks(blocks: Block[]) {
  return blocks.map((block) => ({ ...block, sectionId: topLevelBlockSectionId }));
}

function modalTitle(modal: NonNullable<ModalState>) {
  if (modal.type === "tags") return "编辑 Tags";
  if (modal.type === "social") return "编辑社交按钮";
  if (modal.type === "block") return "编辑 Block";
  if (modal.type === "add-block") return "添加 Block";
  return "项目设置";
}
