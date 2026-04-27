import {
  AspectRatio,
  Box,
  Button,
  Dialog,
  FileUpload,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  Menu,
  NativeSelect,
  NumberInput,
  Text,
  VStack,
} from "@chakra-ui/react";
import { DialogCloseTrigger, DialogContent } from "@components/ui/dialog";
import { Switch } from "@components/ui/switch";
import { Tooltip } from "@components/ui/tooltip";
import {
  LuCheck,
  LuClipboardPaste,
  LuClock3,
  LuChevronDown,
  LuEye,
  LuEyeOff,
  LuGripVertical,
  LuLoaderCircle,
  LuRefreshCw,
  LuSettings2,
  LuTrash2,
  LuUpload,
} from "react-icons/lu";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type {
  BaseCoverTemplateId,
  ChapterGenerationStatus,
  CoverMode,
  CoverSizePresetId,
  CoverSizePresetOption,
  CoverTextColorMode,
  CoverTextPosition,
  CoverTemplateId,
  CoverTemplateOption,
  PageDraft,
} from "../types";
import {
  createAutoCoverDataUrl,
  resolveCoverTemplateDefaults,
} from "../domain/cover";

type DragPreviewAnchor = {
  clientX: number;
  clientY: number;
  offsetX: number;
  offsetY: number;
  width: number;
};

const COVER_TEXT_POSITION_OPTIONS: CoverTextPosition[] = [
  "style_1",
  "style_2",
  "style_3",
  "style_4",
  "style_5",
  "style_6",
];

const COVER_PREVIEW_TITLE_WIDTH = "76%";
const COVER_PREVIEW_AUTHOR_WIDTH = "44%";
const COVER_PREVIEW_TITLE_HEIGHT = "3px";
const COVER_PREVIEW_AUTHOR_HEIGHT = "2px";
const COVER_PREVIEW_TITLE_OPACITY = 0.95;
const COVER_PREVIEW_AUTHOR_OPACITY = 0.55;
const COVER_GRID_TILE_RATIO = 40 / 56;
type CoverTemplateLabelMode = "none" | "bottom" | "side";
const COVER_TEMPLATE_LABEL_MODE: CoverTemplateLabelMode = "bottom";
const SHOW_TEMPLATE_DESCRIPTIONS = false;
type CoverSizeLabelMode = "none" | "bottom" | "side";
const COVER_SIZE_LABEL_MODE: CoverSizeLabelMode = "side";
const SHOW_SIZE_DESCRIPTIONS = true;

function resolveRatioFrameSize(
  ratio: number,
  containerRatio: number = COVER_GRID_TILE_RATIO,
): {
  width: string;
  height: string;
} {
  const normalizedRatio = Math.max(0.2, Math.min(3, ratio));
  const normalizedContainerRatio = Math.max(0.2, Math.min(3, containerRatio));
  const maxSize = 74;
  if (normalizedRatio >= normalizedContainerRatio) {
    return {
      width: `${maxSize}%`,
      height: `${((maxSize * normalizedContainerRatio) / normalizedRatio).toFixed(2)}%`,
    };
  }
  return {
    width: `${((maxSize * normalizedRatio) / normalizedContainerRatio).toFixed(2)}%`,
    height: `${maxSize}%`,
  };
}

function renderGridOptionMeta({
  labelMode,
  label,
  description,
  showDescription,
}: {
  labelMode: "none" | "bottom" | "side";
  label: string;
  description?: string;
  showDescription: boolean;
}): ReactNode {
  if (labelMode === "none") return null;

  const descriptionNode =
    showDescription && description ? (
      <Text
        fontFamily={"ui"}
        fontSize={labelMode === "side" ? "xs" : "2xs"}
        lineHeight={"shorter"}
        color={"app.epub.fg.subtle"}
      >
        {description}
      </Text>
    ) : null;

  if (labelMode === "side") {
    return (
      <VStack align={"start"} gap={0.5} minW={0}>
        <Text
          fontFamily={"ui"}
          fontSize={"sm"}
          color={"app.epub.fg.default"}
          lineClamp={1}
        >
          {label}
        </Text>
        {descriptionNode}
      </VStack>
    );
  }

  return (
    <VStack align={"start"} gap={0.5} pt={1} px={0.5}>
      <Text
        fontFamily={"ui"}
        fontSize={"xs"}
        color={"app.epub.fg.default"}
        lineClamp={1}
      >
        {label}
      </Text>
      {descriptionNode}
    </VStack>
  );
}

type CoverTextPreviewLine = {
  top: string;
  left: string;
};

function resolveCoverTextPreviewLines(style: CoverTextPosition): {
  title: CoverTextPreviewLine;
  author: CoverTextPreviewLine;
} {
  if (style === "style_2") {
    return {
      title: { top: "46%", left: "12%" },
      author: { top: "57%", left: "12%" },
    };
  }

  if (style === "style_3") {
    return {
      title: { top: "46%", left: "20%" },
      author: { top: "57%", left: "44%" },
    };
  }

  if (style === "style_4") {
    return {
      title: { top: "58%", left: "12%" },
      author: { top: "44%", left: "24%" },
    };
  }

  if (style === "style_5") {
    return {
      title: { top: "58%", left: "12%" },
      author: { top: "44%", left: "12%" },
    };
  }

  if (style === "style_6") {
    return {
      title: { top: "74%", left: "12%" },
      author: { top: "86%", left: "24%" },
    };
  }

  return {
    title: { top: "46%", left: "12%" },
    author: { top: "57%", left: "24%" },
  };
}

function isBaseTemplateId(
  value: CoverTemplateId,
): value is BaseCoverTemplateId {
  return (
    value === "classic" ||
    value === "aurora" ||
    value === "ember" ||
    value === "midnight" ||
    value === "sage" ||
    value === "sunset"
  );
}

export function PageDraftCard({
  page,
  previewBookTitle,
  previewBookAuthor,
  chapterNumber,
  isCover,
  coverMode,
  hasCustomCover,
  isCoverEnabled,
  selectedCoverTemplateId,
  coverTemplateOptions,
  selectedCoverSizePresetId,
  coverSizePresetOptions,
  coverTextScalePercent,
  coverTextPosition,
  coverTextColorMode,
  includeTextOnCustomCover,
  onCoverTemplateChange,
  onCoverSizePresetChange,
  onCoverTextScalePercentChange,
  onCoverTextPositionChange,
  onCoverTextColorModeChange,
  onIncludeTextOnCustomCoverChange,
  onReplaceCoverFromFiles,
  onReplaceCoverFromClipboard,
  onResetCoverToAuto,
  onToggleCoverEnabled,
  onRemove,
  onRename,
  onDragStart,
  onTouchDragStart,
  onTouchDragMove,
  onTouchDragEnd,
  onTouchDragCancel,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragging,
  isDropTarget,
  isInteractionDisabled,
  isGenerationStatusFading,
  pageFlashKind,
  pageFlashToken,
  generationStatus,
}: {
  page: PageDraft;
  previewBookTitle?: string;
  previewBookAuthor?: string;
  chapterNumber: number | string;
  isCover?: boolean;
  coverMode?: CoverMode;
  hasCustomCover?: boolean;
  isCoverEnabled?: boolean;
  selectedCoverTemplateId?: CoverTemplateId;
  coverTemplateOptions?: CoverTemplateOption[];
  selectedCoverSizePresetId?: CoverSizePresetId;
  coverSizePresetOptions?: CoverSizePresetOption[];
  coverTextScalePercent?: number;
  coverTextPosition?: CoverTextPosition;
  coverTextColorMode?: CoverTextColorMode;
  includeTextOnCustomCover?: boolean;
  onCoverTemplateChange?: (templateId: CoverTemplateId) => void;
  onCoverSizePresetChange?: (presetId: CoverSizePresetId) => void;
  onCoverTextScalePercentChange?: (value: number) => void;
  onCoverTextPositionChange?: (value: CoverTextPosition) => void;
  onCoverTextColorModeChange?: (value: CoverTextColorMode) => void;
  onIncludeTextOnCustomCoverChange?: (value: boolean) => void;
  onReplaceCoverFromFiles?: (files: FileList | File[]) => Promise<void>;
  onReplaceCoverFromClipboard?: () => Promise<void>;
  onResetCoverToAuto?: () => void;
  onToggleCoverEnabled?: () => void;
  onRemove: (id: string) => void;
  onRename: (id: string, value: string) => void;
  onDragStart: (id: string, anchor: DragPreviewAnchor) => void;
  onTouchDragStart: (id: string, anchor: DragPreviewAnchor) => void;
  onTouchDragMove: (clientX: number, clientY: number) => void;
  onTouchDragEnd: () => void;
  onTouchDragCancel: () => void;
  onDragEnd: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: () => void;
  isDragging: boolean;
  isDropTarget: boolean;
  isInteractionDisabled: boolean;
  isGenerationStatusFading: boolean;
  pageFlashKind?: "added" | "duplicate";
  pageFlashToken?: number;
  generationStatus?: ChapterGenerationStatus;
}) {
  const [titleDraft, setTitleDraft] = useState(page.title);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const coverUploadInputRef = useRef<HTMLInputElement | null>(null);
  const activeTouchPointerIdRef = useRef<number | null>(null);
  const touchStartPointRef = useRef<{ x: number; y: number } | null>(null);
  const hasStartedTouchDragRef = useRef(false);
  const [flashKind, setFlashKind] = useState<"added" | "duplicate" | null>(
    null,
  );
  const [flashOpacity, setFlashOpacity] = useState(0);
  const clearFlashTimerRef = useRef<number | null>(null);
  const effectiveGenerationStatus = generationStatus ?? "pending";
  const showGenerationStatus = generationStatus !== undefined;
  const statusTextColor =
    effectiveGenerationStatus === "completed"
      ? "app.epub.fg.status.completed"
      : effectiveGenerationStatus === "processing"
        ? "app.epub.fg.status.processing"
        : "app.epub.fg.status.pending";
  const flashColorBase =
    flashKind === "added"
      ? "34, 197, 94"
      : flashKind === "duplicate"
        ? "251, 146, 60"
        : null;
  const flashOverlayBg = flashColorBase
    ? `rgba(${flashColorBase}, 0.22)`
    : null;
  const flashBorderColor = flashColorBase
    ? `rgba(${flashColorBase}, ${Math.max(0.2, flashOpacity + 0.16)})`
    : null;
  const flashShadow = flashColorBase
    ? `0 0 0 2px rgba(${flashColorBase}, ${flashOpacity * 0.62})`
    : "none";

  useEffect(() => {
    setTitleDraft(page.title);
  }, [page.title]);

  useEffect(() => {
    if (!pageFlashKind) return;
    if (clearFlashTimerRef.current) {
      window.clearTimeout(clearFlashTimerRef.current);
    }

    setFlashKind(pageFlashKind);
    setFlashOpacity(1);

    const fadeTimer = window.setTimeout(() => {
      setFlashOpacity(0);
    }, 220);

    clearFlashTimerRef.current = window.setTimeout(() => {
      setFlashKind(null);
      clearFlashTimerRef.current = null;
    }, 820);

    return () => {
      window.clearTimeout(fadeTimer);
      if (clearFlashTimerRef.current) {
        window.clearTimeout(clearFlashTimerRef.current);
      }
    };
  }, [pageFlashKind, pageFlashToken]);

  function commitRenameIfChanged() {
    if (titleDraft === page.title) return;
    onRename(page.id, titleDraft);
  }

  function handleTitleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.currentTarget.blur();
  }

  function setCardDragPreview(event: DragEvent<HTMLElement>) {
    const card = cardRef.current;
    const transfer = event.dataTransfer;
    if (!card || !transfer) return;

    const rect = card.getBoundingClientRect();
    const pointerOffsetX =
      event.clientX > 0
        ? Math.max(0, Math.min(rect.width, event.clientX - rect.left))
        : rect.width - 20;
    const pointerOffsetY =
      event.clientY > 0
        ? Math.max(0, Math.min(rect.height, event.clientY - rect.top))
        : rect.height - 20;

    transfer.effectAllowed = "move";
    transfer.setData("text/plain", page.id);

    onDragStart(page.id, {
      clientX: event.clientX || rect.left + pointerOffsetX,
      clientY: event.clientY || rect.top + pointerOffsetY,
      offsetX: pointerOffsetX,
      offsetY: pointerOffsetY,
      width: rect.width,
    });
  }

  function buildDragAnchor(
    clientX: number,
    clientY: number,
  ): DragPreviewAnchor {
    const card = cardRef.current;
    if (!card) {
      return {
        clientX,
        clientY,
        offsetX: 0,
        offsetY: 0,
        width: 0,
      };
    }
    const rect = card.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const offsetY = Math.max(0, Math.min(rect.height, clientY - rect.top));
    return {
      clientX,
      clientY,
      offsetX,
      offsetY,
      width: rect.width,
    };
  }

  function handleGripPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (isInteractionDisabled) return;
    if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
    event.preventDefault();
    event.stopPropagation();
    activeTouchPointerIdRef.current = event.pointerId;
    touchStartPointRef.current = { x: event.clientX, y: event.clientY };
    hasStartedTouchDragRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleGripPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    if (activeTouchPointerIdRef.current !== event.pointerId) return;
    const startPoint = touchStartPointRef.current;
    const movedEnough =
      !!startPoint &&
      Math.hypot(event.clientX - startPoint.x, event.clientY - startPoint.y) >=
        8;
    if (!hasStartedTouchDragRef.current && movedEnough) {
      hasStartedTouchDragRef.current = true;
      onTouchDragStart(page.id, buildDragAnchor(event.clientX, event.clientY));
    }
    if (!hasStartedTouchDragRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    onTouchDragMove(event.clientX, event.clientY);
  }

  function handleGripPointerEnd(event: ReactPointerEvent<HTMLButtonElement>) {
    if (activeTouchPointerIdRef.current !== event.pointerId) return;
    if (hasStartedTouchDragRef.current) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    activeTouchPointerIdRef.current = null;
    touchStartPointRef.current = null;
    if (hasStartedTouchDragRef.current) {
      onTouchDragEnd();
    }
    hasStartedTouchDragRef.current = false;
  }

  function handleGripPointerCancel(
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    if (activeTouchPointerIdRef.current !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    activeTouchPointerIdRef.current = null;
    touchStartPointRef.current = null;
    if (hasStartedTouchDragRef.current) {
      onTouchDragCancel();
    }
    hasStartedTouchDragRef.current = false;
  }

  const controlInputProps = {
    fontFamily: "ui",
    fontSize: "sm",
    rounded: "xl",
  } as const;

  const iconButtonProps = {
    fontFamily: "ui",
    fontSize: "sm",
    rounded: "xl",
  } as const;
  const dialogFieldProps = {
    fontFamily: "ui",
    fontSize: "sm",
    rounded: "lg",
    bg: "app.epub.bg.card",
    color: "app.epub.fg.default",
    borderColor: "app.epub.border.default",
  } as const;
  const dialogOutlineButtonProps = {
    size: "md",
    variant: "outline",
    rounded: "lg",
    borderColor: "app.epub.border.default",
    color: "app.epub.fg.default",
    bg: "app.epub.bg.card",
    _hover: {
      bg: "app.epub.bg.surface",
      color: "app.epub.fg.default",
    },
  } as const;
  const switchProps = {
    controlProps: {
      bg: "app.epub.switch.track.off",
      _checked: { bg: "app.epub.switch.track.on" },
    },
    thumbProps: {
      bg: "app.epub.switch.thumb",
    },
    labelProps: {
      color: "app.epub.switch.label",
    },
  } as const;
  const coverDialogSectionCardBg = {
    base: "app.epub.bg.card",
    _dark: "gray.950",
  } as const;
  const isRemoveDisabled = isInteractionDisabled || isCover;
  const isTitleDisabled = isInteractionDisabled || isCover;
  const canDrag = !isInteractionDisabled && !isCover;
  const selectedCoverSizePreset =
    selectedCoverSizePresetId && coverSizePresetOptions
      ? coverSizePresetOptions.find(
          (option) => option.id === selectedCoverSizePresetId,
        )
      : undefined;
  const availableCoverSizePresetOptions = coverSizePresetOptions ?? [];
  const selectedCoverSizePreviewOption =
    selectedCoverSizePreset ?? availableCoverSizePresetOptions[0] ?? undefined;
  const selectedCoverSizePreviewRatio = selectedCoverSizePreviewOption
    ? selectedCoverSizePreviewOption.width /
      selectedCoverSizePreviewOption.height
    : COVER_GRID_TILE_RATIO;
  const selectedCoverSizeRatioFrame = resolveRatioFrameSize(
    selectedCoverSizePreviewRatio,
  );
  const cardPreviewRatio = 1 / 1.4142;
  const dialogPreviewRatio =
    (selectedCoverSizePreset?.width ?? 1600) /
    (selectedCoverSizePreset?.height ?? 2560);
  const isEffectiveCoverEnabled = isCoverEnabled ?? true;
  const isCoverExportDisabled = Boolean(isCover && !isEffectiveCoverEnabled);
  const isCoverToolDisabled = isInteractionDisabled;
  const effectiveCoverTextScalePercent = coverTextScalePercent ?? 100;
  const effectiveCoverTextPosition = coverTextPosition ?? "style_1";
  const effectiveCoverTextColorMode = coverTextColorMode ?? "adaptive";
  const isTextOnCustomCoverEnabled = includeTextOnCustomCover ?? true;
  const hasCustomCoverValue = hasCustomCover ?? false;
  const availableCoverTemplateOptions = coverTemplateOptions ?? [];
  const selectableCoverTemplateOptions = availableCoverTemplateOptions.filter(
    (option) => option.id !== "custom",
  );
  const selectedTemplatePreviewId =
    selectedCoverTemplateId &&
    availableCoverTemplateOptions.some(
      (option) => option.id === selectedCoverTemplateId,
    )
      ? selectedCoverTemplateId
      : (selectableCoverTemplateOptions[0]?.id ?? "classic");
  const effectivePreviewBookTitle = (previewBookTitle ?? "").trim();
  const effectivePreviewBookAuthor = (previewBookAuthor ?? "").trim();
  const isTemplateSelectionDisabled =
    isInteractionDisabled || selectableCoverTemplateOptions.length === 0;
  const templatePreviewById = useMemo(() => {
    const selectedBaseTemplateId = isBaseTemplateId(selectedTemplatePreviewId)
      ? selectedTemplatePreviewId
      : "classic";

    const previewEntries: [CoverTemplateId, string][] =
      availableCoverTemplateOptions.map((option) => {
        const templateId = isBaseTemplateId(option.id)
          ? option.id
          : selectedBaseTemplateId;
        const defaults = resolveCoverTemplateDefaults(templateId);
        const previewSrc = createAutoCoverDataUrl(
          {
            title: effectivePreviewBookTitle,
            author: effectivePreviewBookAuthor,
            templateId,
            size: { width: 520, height: 780 },
            textScalePercent: defaults.textScalePercent,
            textPosition: effectiveCoverTextPosition,
            textColorMode: defaults.textColorMode,
          },
          "svg",
        );
        return [option.id, previewSrc];
      });

    return Object.fromEntries(previewEntries) as Record<
      CoverTemplateId,
      string
    >;
  }, [
    availableCoverTemplateOptions,
    selectedTemplatePreviewId,
    effectiveCoverTextPosition,
    effectivePreviewBookTitle,
    effectivePreviewBookAuthor,
  ]);

  const selectedCoverTemplatePreviewSrc =
    templatePreviewById[selectedTemplatePreviewId] ??
    templatePreviewById.classic ??
    "";
  const selectedCoverTextPreviewLines = resolveCoverTextPreviewLines(
    effectiveCoverTextPosition,
  );

  function handleCoverUploadChange(event: ChangeEvent<HTMLInputElement>) {
    if (!isCover || !onReplaceCoverFromFiles) return;
    const files = event.target.files;
    if (!files || files.length === 0) return;
    void onReplaceCoverFromFiles(files);
    event.target.value = "";
  }

  function handleCoverDisabledOverlayKeyDown(
    event: KeyboardEvent<HTMLDivElement>,
  ) {
    if (!isCoverExportDisabled || isInteractionDisabled) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onToggleCoverEnabled?.();
  }

  function handleCoverTextScaleChange(value: string) {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    onCoverTextScalePercentChange?.(parsed);
  }

  return (
    <Box
      ref={cardRef}
      w={"full"}
      borderWidth={isDropTarget ? "2px" : "1px"}
      borderStyle={isDropTarget ? "dashed" : "solid"}
      borderColor={
        flashBorderColor ??
        (isDropTarget ? "app.epub.border.accent" : "app.epub.border.default")
      }
      position={"relative"}
      boxShadow={flashShadow}
      transition={"border-color 0.6s ease, box-shadow 0.6s ease"}
      rounded={"2xl"}
      overflow={"hidden"}
      bg={"app.epub.bg.card"}
      opacity={isDragging ? 0.6 : 1}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <Box borderBottomWidth={"1px"} borderColor={"app.epub.border.muted"}>
        {isCover ? (
          <HStack
            h={"2.25rem"}
            px={2}
            justify={"space-between"}
            align={"center"}
          >
            <Text
              fontFamily={"ui"}
              fontSize={"sm"}
              fontWeight={"medium"}
              color={"app.epub.fg.default"}
            >
              Cover
            </Text>

            <HStack gap={1}>
              <Tooltip
                content={
                  isEffectiveCoverEnabled
                    ? "Disable cover in generated EPUB"
                    : "Enable cover in generated EPUB"
                }
              >
                <IconButton
                  size={"xs"}
                  variant={"ghost"}
                  aria-label={
                    isEffectiveCoverEnabled ? "Disable cover" : "Enable cover"
                  }
                  onClick={() => onToggleCoverEnabled?.()}
                  disabled={isInteractionDisabled}
                  color={
                    isEffectiveCoverEnabled
                      ? "app.epub.fg.default"
                      : "app.epub.fg.subtle"
                  }
                >
                  {isEffectiveCoverEnabled ? <LuEye /> : <LuEyeOff />}
                </IconButton>
              </Tooltip>
              <Dialog.Root>
                <Tooltip content={"Cover settings"}>
                  <Dialog.Trigger asChild>
                    <IconButton
                      size={"xs"}
                      variant={"ghost"}
                      aria-label={`Open cover settings (${coverMode === "custom" ? "custom image" : "auto-generated"})`}
                      disabled={isInteractionDisabled}
                    >
                      <LuSettings2 />
                    </IconButton>
                  </Dialog.Trigger>
                </Tooltip>

                <DialogContent
                  bg={"app.epub.bg.surface"}
                  color={"app.epub.fg.default"}
                  rounded={"2xl"}
                  borderWidth={"1px"}
                  borderColor={"app.epub.border.default"}
                  maxW={"1120px"}
                >
                  <Dialog.Header
                    display={"flex"}
                    alignItems={"center"}
                    justifyContent={"flex-start"}
                    gap={2}
                  >
                    <Dialog.Title fontFamily={"ui"}>
                      Cover settings
                    </Dialog.Title>
                    <Button
                      {...dialogOutlineButtonProps}
                      size={"sm"}
                      onClick={() => onToggleCoverEnabled?.()}
                      disabled={isInteractionDisabled}
                    >
                      <HStack gap={1.5}>
                        <Icon boxSize={4}>
                          {isEffectiveCoverEnabled ? <LuEyeOff /> : <LuEye />}
                        </Icon>
                        <Text>
                          {isEffectiveCoverEnabled
                            ? "Disable cover"
                            : "Enable cover"}
                        </Text>
                      </HStack>
                    </Button>
                  </Dialog.Header>

                  <Dialog.Body>
                    <Box
                      display={"grid"}
                      gap={5}
                      gridTemplateColumns={{
                        base: "minmax(0, 1fr)",
                        lg: "minmax(0, 1fr) minmax(0, 1fr)",
                      }}
                      alignItems={"start"}
                    >
                      <VStack align={"stretch"} gap={3}>
                        <Box
                          p={4}
                          rounded={"xl"}
                          bg={coverDialogSectionCardBg}
                          borderWidth={"1px"}
                          borderColor={"app.epub.border.default"}
                        >
                          <Text
                            fontFamily={"ui"}
                            fontSize={"sm"}
                            fontWeight={"semibold"}
                            color={"app.epub.fg.default"}
                            mb={3}
                          >
                            Template & Size
                          </Text>
                          <Box
                            display={"grid"}
                            gap={3}
                            gridTemplateColumns={{
                              base: "minmax(0, 1fr)",
                              md: "repeat(3, minmax(0, 1fr))",
                            }}
                          >
                            <Box>
                              <Text
                                fontSize={"sm"}
                                color={"app.epub.fg.muted"}
                                mb={1}
                              >
                                Cover template
                              </Text>
                              <Menu.Root
                                positioning={{
                                  placement: "bottom-start",
                                }}
                              >
                                <Menu.Trigger asChild>
                                  <Button
                                    {...dialogFieldProps}
                                    size={"md"}
                                    h={"64px"}
                                    minH={"64px"}
                                    rounded={"lg"}
                                    w={"full"}
                                    p={1}
                                    justifyContent={"flex-start"}
                                    disabled={isTemplateSelectionDisabled}
                                    aria-label={"Select cover template"}
                                  >
                                    <HStack
                                      w={"full"}
                                      justify={"space-between"}
                                      gap={2}
                                    >
                                      <HStack align={"center"} gap={2} minW={0}>
                                        <Box
                                          w={"40px"}
                                          h={"56px"}
                                          rounded={"sm"}
                                          borderWidth={"1px"}
                                          borderColor={
                                            "app.epub.border.default"
                                          }
                                          bg={"app.epub.bg.preview"}
                                          style={{
                                            backgroundImage:
                                              selectedCoverTemplatePreviewSrc
                                                ? `url("${selectedCoverTemplatePreviewSrc}")`
                                                : undefined,
                                            backgroundSize: "cover",
                                            backgroundPosition: "center",
                                          }}
                                          position={"relative"}
                                          overflow={"hidden"}
                                        />
                                        <Text
                                          fontFamily={"ui"}
                                          fontSize={"sm"}
                                          color={"app.epub.fg.default"}
                                          lineClamp={1}
                                          textAlign={"left"}
                                        >
                                          {availableCoverTemplateOptions.find(
                                            (option) =>
                                              option.id ===
                                              selectedTemplatePreviewId,
                                          )?.label ?? "Template"}
                                        </Text>
                                      </HStack>
                                      <Icon
                                        color={"app.epub.fg.muted"}
                                        flexShrink={0}
                                      >
                                        <LuChevronDown />
                                      </Icon>
                                    </HStack>
                                  </Button>
                                </Menu.Trigger>
                                <Menu.Positioner>
                                  <Menu.Content
                                    bg={"app.epub.bg.card"}
                                    borderColor={"app.epub.border.default"}
                                    minW={"220px"}
                                    p={2}
                                    rounded={"lg"}
                                    overflow={"hidden"}
                                    display={"grid"}
                                    gridTemplateColumns={
                                      COVER_TEMPLATE_LABEL_MODE === "side"
                                        ? "minmax(0, 1fr)"
                                        : "repeat(3, minmax(0, 1fr))"
                                    }
                                    gap={2}
                                  >
                                    {availableCoverTemplateOptions.map(
                                      (option) => {
                                        const previewSrc =
                                          templatePreviewById[option.id];
                                        const isSelected =
                                          option.id ===
                                          selectedTemplatePreviewId;
                                        const isCustomOption =
                                          option.id === "custom";

                                        return (
                                          <Menu.Item
                                            key={option.id}
                                            value={option.id}
                                            rounded={"md"}
                                            p={0}
                                            bg={"transparent"}
                                            _hover={{ bg: "transparent" }}
                                            disabled={isCustomOption}
                                            onClick={() =>
                                              isCustomOption
                                                ? undefined
                                                : onCoverTemplateChange?.(
                                                    option.id,
                                                  )
                                            }
                                          >
                                            <VStack
                                              align={
                                                COVER_TEMPLATE_LABEL_MODE ===
                                                "side"
                                                  ? "start"
                                                  : "stretch"
                                              }
                                              gap={0.5}
                                              w={"full"}
                                            >
                                              <HStack
                                                align={"start"}
                                                gap={
                                                  COVER_TEMPLATE_LABEL_MODE ===
                                                  "side"
                                                    ? 2
                                                    : 0
                                                }
                                              >
                                                <AspectRatio
                                                  ratio={COVER_GRID_TILE_RATIO}
                                                  w={"full"}
                                                  flex={
                                                    COVER_TEMPLATE_LABEL_MODE ===
                                                    "side"
                                                      ? "0 0 64px"
                                                      : undefined
                                                  }
                                                >
                                                  <Box
                                                    rounded={"sm"}
                                                    borderWidth={
                                                      isSelected ? "3px" : "1px"
                                                    }
                                                    borderColor={
                                                      isSelected
                                                        ? "app.epub.button.primary.border"
                                                        : "app.epub.border.default"
                                                    }
                                                    bg={"app.epub.bg.preview"}
                                                    style={{
                                                      backgroundImage:
                                                        previewSrc
                                                          ? `url("${previewSrc}")`
                                                          : undefined,
                                                      backgroundSize: "cover",
                                                      backgroundPosition:
                                                        "center",
                                                    }}
                                                    position={"relative"}
                                                    overflow={"hidden"}
                                                    outline={
                                                      isSelected
                                                        ? "2px solid"
                                                        : "none"
                                                    }
                                                    outlineColor={
                                                      isSelected
                                                        ? "app.epub.button.primary.border"
                                                        : "transparent"
                                                    }
                                                    transition={
                                                      "border-color 0.16s ease"
                                                    }
                                                    opacity={
                                                      isCustomOption ? 0.82 : 1
                                                    }
                                                  >
                                                    {isCustomOption ? (
                                                      <Box
                                                        position={"absolute"}
                                                        inset={1.5}
                                                        rounded={"xs"}
                                                        borderWidth={"1px"}
                                                        borderStyle={"dashed"}
                                                        borderColor={
                                                          "app.epub.border.default"
                                                        }
                                                      />
                                                    ) : null}
                                                    {isSelected ? (
                                                      <Box
                                                        position={"absolute"}
                                                        top={1}
                                                        right={1}
                                                        w={"16px"}
                                                        h={"16px"}
                                                        rounded={"full"}
                                                        bg={
                                                          "app.epub.button.primary.bg"
                                                        }
                                                        color={
                                                          "app.epub.button.primary.fg"
                                                        }
                                                        display={"grid"}
                                                        placeItems={"center"}
                                                        borderWidth={"1px"}
                                                        borderColor={
                                                          "app.epub.bg.card"
                                                        }
                                                      >
                                                        <Icon boxSize={2.5}>
                                                          <LuCheck />
                                                        </Icon>
                                                      </Box>
                                                    ) : null}
                                                  </Box>
                                                </AspectRatio>
                                                {COVER_TEMPLATE_LABEL_MODE ===
                                                "side"
                                                  ? renderGridOptionMeta({
                                                      labelMode:
                                                        COVER_TEMPLATE_LABEL_MODE,
                                                      label: option.label,
                                                      description:
                                                        option.description,
                                                      showDescription:
                                                        SHOW_TEMPLATE_DESCRIPTIONS,
                                                    })
                                                  : null}
                                              </HStack>
                                              {COVER_TEMPLATE_LABEL_MODE ===
                                              "bottom"
                                                ? renderGridOptionMeta({
                                                    labelMode:
                                                      COVER_TEMPLATE_LABEL_MODE,
                                                    label: option.label,
                                                    description:
                                                      option.description,
                                                    showDescription:
                                                      SHOW_TEMPLATE_DESCRIPTIONS,
                                                  })
                                                : null}
                                            </VStack>
                                          </Menu.Item>
                                        );
                                      },
                                    )}
                                  </Menu.Content>
                                </Menu.Positioner>
                              </Menu.Root>
                            </Box>

                            <Box>
                              <Text
                                fontSize={"sm"}
                                color={"app.epub.fg.muted"}
                                mb={1}
                              >
                                Cover size
                              </Text>
                              <Menu.Root
                                positioning={{
                                  placement: "bottom-start",
                                }}
                              >
                                <Menu.Trigger asChild>
                                  <Button
                                    {...dialogFieldProps}
                                    size={"md"}
                                    h={"64px"}
                                    minH={"64px"}
                                    rounded={"lg"}
                                    w={"full"}
                                    p={1}
                                    justifyContent={"flex-start"}
                                    disabled={
                                      isInteractionDisabled ||
                                      availableCoverSizePresetOptions.length ===
                                        0
                                    }
                                    aria-label={"Select cover size preset"}
                                  >
                                    <HStack
                                      w={"full"}
                                      justify={"space-between"}
                                      gap={2}
                                    >
                                      <HStack align={"center"} gap={2} minW={0}>
                                        <Box w={"40px"} flex={"0 0 40px"}>
                                          <AspectRatio
                                            ratio={COVER_GRID_TILE_RATIO}
                                            w={"full"}
                                          >
                                            <Box
                                              rounded={"sm"}
                                              borderWidth={"1px"}
                                              borderColor={
                                                "app.epub.border.default"
                                              }
                                              bg={"app.epub.bg.preview"}
                                              position={"relative"}
                                              overflow={"hidden"}
                                            >
                                              <Box
                                                position={"absolute"}
                                                left={"50%"}
                                                top={"50%"}
                                                transform={
                                                  "translate(-50%, -50%)"
                                                }
                                                w={
                                                  selectedCoverSizeRatioFrame.width
                                                }
                                                h={
                                                  selectedCoverSizeRatioFrame.height
                                                }
                                                borderWidth={"1px"}
                                                borderStyle={"solid"}
                                                borderColor={
                                                  "app.epub.fg.default"
                                                }
                                                rounded={"xs"}
                                                bg={"transparent"}
                                              />
                                            </Box>
                                          </AspectRatio>
                                        </Box>
                                        <VStack
                                          align={"start"}
                                          gap={0}
                                          minW={0}
                                          textAlign={"left"}
                                        >
                                          <Text
                                            fontFamily={"ui"}
                                            fontSize={"sm"}
                                            color={"app.epub.fg.default"}
                                            lineClamp={1}
                                            textAlign={"left"}
                                          >
                                            {selectedCoverSizePreviewOption?.label ??
                                              "Size"}
                                          </Text>
                                          <Text
                                            fontFamily={"ui"}
                                            fontSize={"xs"}
                                            color={"app.epub.fg.subtle"}
                                            lineClamp={1}
                                            textAlign={"left"}
                                          >
                                            {selectedCoverSizePreviewOption?.description ??
                                              ""}
                                          </Text>
                                        </VStack>
                                      </HStack>
                                      <Icon
                                        color={"app.epub.fg.muted"}
                                        flexShrink={0}
                                      >
                                        <LuChevronDown />
                                      </Icon>
                                    </HStack>
                                  </Button>
                                </Menu.Trigger>
                                <Menu.Positioner>
                                  <Menu.Content
                                    bg={"app.epub.bg.card"}
                                    borderColor={"app.epub.border.default"}
                                    minW={"220px"}
                                    p={2}
                                    rounded={"lg"}
                                    overflow={"hidden"}
                                    display={"grid"}
                                    gridTemplateColumns={
                                      COVER_SIZE_LABEL_MODE === "side"
                                        ? "minmax(0, 1fr)"
                                        : "repeat(3, minmax(0, 1fr))"
                                    }
                                    gap={2}
                                  >
                                    {availableCoverSizePresetOptions.map(
                                      (option) => {
                                        const optionRatio =
                                          option.width / option.height;
                                        const optionRatioFrame =
                                          resolveRatioFrameSize(optionRatio);
                                        const isSelected =
                                          option.id ===
                                          selectedCoverSizePreviewOption?.id;

                                        return (
                                          <Menu.Item
                                            key={option.id}
                                            value={option.id}
                                            rounded={"md"}
                                            p={0}
                                            bg={"transparent"}
                                            _hover={{ bg: "transparent" }}
                                            onClick={() =>
                                              onCoverSizePresetChange?.(
                                                option.id,
                                              )
                                            }
                                          >
                                            <VStack
                                              align={
                                                COVER_SIZE_LABEL_MODE === "side"
                                                  ? "start"
                                                  : "stretch"
                                              }
                                              gap={0.5}
                                              w={"full"}
                                            >
                                              <HStack
                                                align={"start"}
                                                gap={
                                                  COVER_SIZE_LABEL_MODE ===
                                                  "side"
                                                    ? 2
                                                    : 0
                                                }
                                              >
                                                <AspectRatio
                                                  ratio={COVER_GRID_TILE_RATIO}
                                                  w={"full"}
                                                  flex={
                                                    COVER_SIZE_LABEL_MODE ===
                                                    "side"
                                                      ? "0 0 64px"
                                                      : undefined
                                                  }
                                                >
                                                  <Box
                                                    rounded={"sm"}
                                                    borderWidth={
                                                      isSelected ? "3px" : "1px"
                                                    }
                                                    borderColor={
                                                      isSelected
                                                        ? "app.epub.button.primary.border"
                                                        : "app.epub.border.default"
                                                    }
                                                    bg={"app.epub.bg.preview"}
                                                    position={"relative"}
                                                    overflow={"hidden"}
                                                    outline={
                                                      isSelected
                                                        ? "2px solid"
                                                        : "none"
                                                    }
                                                    outlineColor={
                                                      isSelected
                                                        ? "app.epub.button.primary.border"
                                                        : "transparent"
                                                    }
                                                    transition={
                                                      "border-color 0.16s ease"
                                                    }
                                                  >
                                                    <Box
                                                      position={"absolute"}
                                                      left={"50%"}
                                                      top={"50%"}
                                                      transform={
                                                        "translate(-50%, -50%)"
                                                      }
                                                      w={optionRatioFrame.width}
                                                      h={
                                                        optionRatioFrame.height
                                                      }
                                                      borderWidth={"1px"}
                                                      borderStyle={"solid"}
                                                      borderColor={
                                                        "app.epub.fg.default"
                                                      }
                                                      rounded={"xs"}
                                                      bg={"transparent"}
                                                    />
                                                    {isSelected ? (
                                                      <Box
                                                        position={"absolute"}
                                                        top={1}
                                                        right={1}
                                                        w={"16px"}
                                                        h={"16px"}
                                                        rounded={"full"}
                                                        bg={
                                                          "app.epub.button.primary.bg"
                                                        }
                                                        color={
                                                          "app.epub.button.primary.fg"
                                                        }
                                                        display={"grid"}
                                                        placeItems={"center"}
                                                        borderWidth={"1px"}
                                                        borderColor={
                                                          "app.epub.bg.card"
                                                        }
                                                      >
                                                        <Icon boxSize={2.5}>
                                                          <LuCheck />
                                                        </Icon>
                                                      </Box>
                                                    ) : null}
                                                  </Box>
                                                </AspectRatio>
                                                {COVER_SIZE_LABEL_MODE ===
                                                "side"
                                                  ? renderGridOptionMeta({
                                                      labelMode:
                                                        COVER_SIZE_LABEL_MODE,
                                                      label: option.label,
                                                      description:
                                                        option.description,
                                                      showDescription:
                                                        SHOW_SIZE_DESCRIPTIONS,
                                                    })
                                                  : null}
                                              </HStack>
                                              {COVER_SIZE_LABEL_MODE ===
                                              "bottom"
                                                ? renderGridOptionMeta({
                                                    labelMode:
                                                      COVER_SIZE_LABEL_MODE,
                                                    label: option.label,
                                                    description:
                                                      option.description,
                                                    showDescription:
                                                      SHOW_SIZE_DESCRIPTIONS,
                                                  })
                                                : null}
                                            </VStack>
                                          </Menu.Item>
                                        );
                                      },
                                    )}
                                  </Menu.Content>
                                </Menu.Positioner>
                              </Menu.Root>
                            </Box>

                            <Box>
                              <Text
                                fontSize={"sm"}
                                color={"app.epub.fg.muted"}
                                mb={1}
                              >
                                Text position
                              </Text>
                              <Menu.Root
                                positioning={{
                                  placement: "bottom-start",
                                }}
                              >
                                <Menu.Trigger asChild>
                                  <Button
                                    {...dialogFieldProps}
                                    size={"md"}
                                    h={"64px"}
                                    minH={"64px"}
                                    rounded={"lg"}
                                    w={"auto"}
                                    minW={"unset"}
                                    p={1}
                                    gap={1.5}
                                    disabled={isInteractionDisabled}
                                    aria-label={
                                      "Select cover text position style"
                                    }
                                  >
                                    <Box
                                      w={"40px"}
                                      h={"56px"}
                                      rounded={"sm"}
                                      borderWidth={"1px"}
                                      borderColor={"app.epub.border.default"}
                                      bg={"app.epub.bg.preview"}
                                      position={"relative"}
                                      overflow={"hidden"}
                                    >
                                      <Box
                                        position={"absolute"}
                                        top={
                                          selectedCoverTextPreviewLines.title
                                            .top
                                        }
                                        left={
                                          selectedCoverTextPreviewLines.title
                                            .left
                                        }
                                        w={COVER_PREVIEW_TITLE_WIDTH}
                                        h={COVER_PREVIEW_TITLE_HEIGHT}
                                        bg={"app.epub.fg.default"}
                                        rounded={"full"}
                                        opacity={COVER_PREVIEW_TITLE_OPACITY}
                                      />
                                      <Box
                                        position={"absolute"}
                                        top={
                                          selectedCoverTextPreviewLines.author
                                            .top
                                        }
                                        left={
                                          selectedCoverTextPreviewLines.author
                                            .left
                                        }
                                        w={COVER_PREVIEW_AUTHOR_WIDTH}
                                        h={COVER_PREVIEW_AUTHOR_HEIGHT}
                                        bg={"app.epub.fg.muted"}
                                        rounded={"full"}
                                        opacity={COVER_PREVIEW_AUTHOR_OPACITY}
                                      />
                                    </Box>
                                    <Icon color={"app.epub.fg.muted"}>
                                      <LuChevronDown />
                                    </Icon>
                                  </Button>
                                </Menu.Trigger>
                                <Menu.Positioner>
                                  <Menu.Content
                                    bg={"app.epub.bg.card"}
                                    borderColor={"app.epub.border.default"}
                                    minW={"220px"}
                                    p={2}
                                    rounded={"lg"}
                                    overflow={"hidden"}
                                    display={"grid"}
                                    gridTemplateColumns={
                                      "repeat(3, minmax(0, 1fr))"
                                    }
                                    gap={2}
                                  >
                                    {COVER_TEXT_POSITION_OPTIONS.map(
                                      (styleOption) => {
                                        const previewLines =
                                          resolveCoverTextPreviewLines(
                                            styleOption,
                                          );
                                        const isSelected =
                                          styleOption ===
                                          effectiveCoverTextPosition;

                                        return (
                                          <Menu.Item
                                            key={styleOption}
                                            value={styleOption}
                                            rounded={"md"}
                                            p={0}
                                            bg={"transparent"}
                                            _hover={{ bg: "transparent" }}
                                            onClick={() =>
                                              onCoverTextPositionChange?.(
                                                styleOption,
                                              )
                                            }
                                          >
                                            <Box
                                              w={"full"}
                                              h={"72px"}
                                              rounded={"sm"}
                                              borderWidth={
                                                isSelected ? "3px" : "1px"
                                              }
                                              borderColor={
                                                isSelected
                                                  ? "app.epub.button.primary.border"
                                                  : "app.epub.border.default"
                                              }
                                              bg={"app.epub.bg.preview"}
                                              position={"relative"}
                                              overflow={"hidden"}
                                              outline={
                                                isSelected
                                                  ? "2px solid"
                                                  : "none"
                                              }
                                              outlineColor={
                                                isSelected
                                                  ? "app.epub.button.primary.border"
                                                  : "transparent"
                                              }
                                              transition={
                                                "border-color 0.16s ease"
                                              }
                                            >
                                              <Box
                                                position={"absolute"}
                                                top={previewLines.title.top}
                                                left={previewLines.title.left}
                                                w={COVER_PREVIEW_TITLE_WIDTH}
                                                h={COVER_PREVIEW_TITLE_HEIGHT}
                                                bg={"app.epub.fg.default"}
                                                rounded={"full"}
                                                opacity={
                                                  COVER_PREVIEW_TITLE_OPACITY
                                                }
                                              />
                                              <Box
                                                position={"absolute"}
                                                top={previewLines.author.top}
                                                left={previewLines.author.left}
                                                w={COVER_PREVIEW_AUTHOR_WIDTH}
                                                h={COVER_PREVIEW_AUTHOR_HEIGHT}
                                                bg={"app.epub.fg.muted"}
                                                rounded={"full"}
                                                opacity={
                                                  COVER_PREVIEW_AUTHOR_OPACITY
                                                }
                                              />
                                              {isSelected ? (
                                                <Box
                                                  position={"absolute"}
                                                  top={1}
                                                  right={1}
                                                  w={"16px"}
                                                  h={"16px"}
                                                  rounded={"full"}
                                                  bg={
                                                    "app.epub.button.primary.bg"
                                                  }
                                                  color={
                                                    "app.epub.button.primary.fg"
                                                  }
                                                  display={"grid"}
                                                  placeItems={"center"}
                                                  borderWidth={"1px"}
                                                  borderColor={
                                                    "app.epub.bg.card"
                                                  }
                                                >
                                                  <Icon boxSize={2.5}>
                                                    <LuCheck />
                                                  </Icon>
                                                </Box>
                                              ) : null}
                                            </Box>
                                          </Menu.Item>
                                        );
                                      },
                                    )}
                                  </Menu.Content>
                                </Menu.Positioner>
                              </Menu.Root>
                            </Box>
                          </Box>
                        </Box>

                        <Box
                          p={4}
                          rounded={"xl"}
                          bg={coverDialogSectionCardBg}
                          borderWidth={"1px"}
                          borderColor={"app.epub.border.default"}
                        >
                          <Text
                            fontFamily={"ui"}
                            fontSize={"sm"}
                            fontWeight={"semibold"}
                            color={"app.epub.fg.default"}
                            mb={3}
                          >
                            Image & Text
                          </Text>
                          <VStack align={"stretch"} gap={2}>
                            <HStack gap={2} wrap={"wrap"}>
                              <HStack gap={0} align={"stretch"}>
                                <Button
                                  {...dialogOutlineButtonProps}
                                  roundedRight={0}
                                  borderRightWidth={"0"}
                                  onClick={() =>
                                    void onReplaceCoverFromClipboard?.()
                                  }
                                  disabled={isCoverToolDisabled}
                                >
                                  <HStack gap={1.5}>
                                    <Icon>
                                      <LuClipboardPaste />
                                    </Icon>
                                    <Text>Paste custom image</Text>
                                  </HStack>
                                </Button>
                                <FileUpload.Root maxFiles={1}>
                                  <FileUpload.HiddenInput
                                    ref={coverUploadInputRef}
                                    aria-label={"Upload cover image"}
                                    accept={"image/*"}
                                    onChange={handleCoverUploadChange}
                                  />
                                  <Tooltip content={"Upload custom image"}>
                                    <IconButton
                                      {...dialogOutlineButtonProps}
                                      roundedLeft={0}
                                      borderLeftWidth={"1px"}
                                      borderLeftColor={
                                        "app.epub.border.default"
                                      }
                                      aria-label={"Upload custom image"}
                                      onClick={() =>
                                        coverUploadInputRef.current?.click()
                                      }
                                      disabled={isCoverToolDisabled}
                                    >
                                      <LuUpload />
                                    </IconButton>
                                  </Tooltip>
                                </FileUpload.Root>
                              </HStack>

                              <Button
                                {...dialogOutlineButtonProps}
                                onClick={() => onResetCoverToAuto?.()}
                                disabled={
                                  isCoverToolDisabled || !hasCustomCoverValue
                                }
                              >
                                <HStack gap={1.5}>
                                  <Icon>
                                    <LuRefreshCw />
                                  </Icon>
                                  <Text>Reset to auto cover</Text>
                                </HStack>
                              </Button>
                            </HStack>

                            <Switch
                              {...switchProps}
                              checked={isTextOnCustomCoverEnabled}
                              onCheckedChange={(details) =>
                                onIncludeTextOnCustomCoverChange?.(
                                  details.checked,
                                )
                              }
                              disabled={
                                isInteractionDisabled || !hasCustomCoverValue
                              }
                            >
                              Show title/author text on custom image
                            </Switch>

                            <Box>
                              <Text
                                fontSize={"sm"}
                                color={"app.epub.fg.muted"}
                                mb={1}
                              >
                                Cover text size (%)
                              </Text>
                              <NumberInput.Root
                                {...dialogFieldProps}
                                size={"md"}
                                value={String(effectiveCoverTextScalePercent)}
                                min={70}
                                max={180}
                                step={5}
                                onValueChange={(details) =>
                                  handleCoverTextScaleChange(details.value)
                                }
                                disabled={isInteractionDisabled}
                                maxW={"220px"}
                              >
                                <NumberInput.Control />
                                <NumberInput.Input
                                  fontFamily={"ui"}
                                  fontSize={"sm"}
                                  rounded={"lg"}
                                  bg={"app.epub.bg.card"}
                                  color={"app.epub.fg.default"}
                                />
                              </NumberInput.Root>
                            </Box>

                            <Box>
                              <Text
                                fontSize={"sm"}
                                color={"app.epub.fg.muted"}
                                mb={1}
                              >
                                Text color
                              </Text>
                              <NativeSelect.Root
                                {...dialogFieldProps}
                                size={"md"}
                                disabled={isInteractionDisabled}
                                maxW={"220px"}
                              >
                                <NativeSelect.Field
                                  fontFamily={"ui"}
                                  fontSize={"sm"}
                                  rounded={"lg"}
                                  value={effectiveCoverTextColorMode}
                                  aria-label={"Select cover text color mode"}
                                  onChange={(event) =>
                                    onCoverTextColorModeChange?.(
                                      event.currentTarget
                                        .value as CoverTextColorMode,
                                    )
                                  }
                                >
                                  <option value={"light"}>Light</option>
                                  <option value={"dark"}>Dark</option>
                                  <option value={"adaptive"}>Adaptive</option>
                                </NativeSelect.Field>
                                <NativeSelect.Indicator />
                              </NativeSelect.Root>
                            </Box>
                          </VStack>
                        </Box>
                      </VStack>

                      <Box>
                        <AspectRatio ratio={dialogPreviewRatio}>
                          <Box
                            position={"relative"}
                            borderWidth={"1px"}
                            borderColor={"app.epub.border.default"}
                            rounded={"lg"}
                            overflow={"hidden"}
                            bg={"app.epub.bg.preview"}
                          >
                            <iframe
                              title={`cover-dialog-preview-${page.id}`}
                              srcDoc={page.previewHtml}
                              sandbox=""
                              style={{
                                width: "100%",
                                height: "100%",
                                border: "none",
                                pointerEvents: "none",
                                filter:
                                  isInteractionDisabled || isCoverExportDisabled
                                    ? "blur(2.5px) grayscale(0.35) saturate(0.75) brightness(0.82)"
                                    : "none",
                                transition: "filter 0.2s ease",
                              }}
                            />
                            {!isEffectiveCoverEnabled ? (
                              <Box
                                position={"absolute"}
                                inset={0}
                                pointerEvents={
                                  isCoverExportDisabled &&
                                  !isInteractionDisabled
                                    ? "auto"
                                    : "none"
                                }
                                bg={"app.epub.overlay.preview"}
                                cursor={
                                  isCoverExportDisabled &&
                                  !isInteractionDisabled
                                    ? "pointer"
                                    : "default"
                                }
                                role={
                                  isCoverExportDisabled &&
                                  !isInteractionDisabled
                                    ? "button"
                                    : undefined
                                }
                                tabIndex={
                                  isCoverExportDisabled &&
                                  !isInteractionDisabled
                                    ? 0
                                    : undefined
                                }
                                onClick={() => {
                                  if (
                                    !isCoverExportDisabled ||
                                    isInteractionDisabled
                                  ) {
                                    return;
                                  }
                                  onToggleCoverEnabled?.();
                                }}
                                onKeyDown={handleCoverDisabledOverlayKeyDown}
                              >
                                <Box
                                  position={"absolute"}
                                  inset={0}
                                  display={"flex"}
                                  alignItems={"center"}
                                  justifyContent={"center"}
                                  px={3}
                                >
                                  <HStack
                                    gap={1.5}
                                    bg={"app.epub.bg.card"}
                                    borderWidth={"1px"}
                                    borderColor={"app.epub.border.default"}
                                    rounded={"full"}
                                    px={3}
                                    py={1.5}
                                  >
                                    <Icon
                                      boxSize={3.5}
                                      color={"app.epub.fg.default"}
                                    >
                                      <LuEyeOff />
                                    </Icon>
                                    <Text
                                      fontFamily={"ui"}
                                      fontSize={"xs"}
                                      fontWeight={"semibold"}
                                      color={"app.epub.fg.default"}
                                      lineHeight={1.1}
                                    >
                                      Enable cover
                                    </Text>
                                  </HStack>
                                </Box>
                              </Box>
                            ) : null}
                          </Box>
                        </AspectRatio>
                      </Box>
                    </Box>
                  </Dialog.Body>

                  <DialogCloseTrigger />
                </DialogContent>
              </Dialog.Root>
            </HStack>
          </HStack>
        ) : (
          <InputGroup
            startAddon={chapterNumber}
            startAddonProps={{
              minW: "2.25rem",
              justifyContent: "center",
              fontSize: "xs",
              fontWeight: "semibold",
              color: "app.epub.fg.muted",
              borderLeftWidth: 0,
              borderTopWidth: 0,
              borderBottomWidth: "1px",
              rounded: "none",
            }}
            endAddon={
              <Tooltip content={"Remove"}>
                <Button
                  {...iconButtonProps}
                  size={"sm"}
                  variant={"ghost"}
                  onClick={() => onRemove(page.id)}
                  aria-label={"Remove page"}
                  disabled={isRemoveDisabled}
                  px={2}
                  minW={"auto"}
                  rounded={"none"}
                  color={"app.epub.fg.danger"}
                  _hover={{ bg: "app.status.danger.bg" }}
                >
                  <Icon>
                    <LuTrash2 />
                  </Icon>
                </Button>
              </Tooltip>
            }
            endAddonProps={{
              borderRightWidth: 0,
              borderTopWidth: 0,
              borderBottomWidth: "1px",
              rounded: "none",
              p: 0,
            }}
          >
            <Input
              {...controlInputProps}
              size={"sm"}
              rounded={"none"}
              borderLeftWidth={0}
              borderRightWidth={0}
              borderTopWidth={0}
              borderBottomWidth={"1px"}
              borderBottomColor={"app.epub.border.muted"}
              bg={"app.epub.bg.card"}
              color={"app.epub.fg.default"}
              _placeholder={{ color: "app.epub.fg.subtle" }}
              value={titleDraft}
              disabled={isTitleDisabled}
              onChange={(event) => setTitleDraft(event.target.value)}
              onBlur={commitRenameIfChanged}
              onKeyDown={handleTitleKeyDown}
            />
          </InputGroup>
        )}
      </Box>
      <AspectRatio
        position={"relative"}
        ratio={cardPreviewRatio}
        bg={"app.epub.bg.preview"}
        cursor={"default"}
      >
        <Box position={"relative"} w={"full"} h={"full"}>
          {!isCover ? (
            <Tooltip content={"Drag to reorder"}>
              <Button
                variant={"subtle"}
                position={"absolute"}
                bottom={2}
                right={2}
                zIndex={5}
                px={2}
                minW={"auto"}
                rounded={"full"}
                cursor={canDrag ? "grab" : "not-allowed"}
                draggable={canDrag}
                disabled={!canDrag}
                touchAction={"none"}
                bg={"blackAlpha.300"}
                color={"app.epub.fg.muted"}
                _hover={{
                  bg: "blackAlpha.400",
                  color: "app.epub.fg.default",
                }}
                onDragStart={(event) => {
                  if (!canDrag) return;
                  if (activeTouchPointerIdRef.current !== null) {
                    event.preventDefault();
                    return;
                  }
                  event.stopPropagation();
                  setCardDragPreview(event);
                }}
                onDragEnd={(event) => {
                  event.stopPropagation();
                  onDragEnd();
                }}
                onPointerDown={handleGripPointerDown}
                onPointerMove={handleGripPointerMove}
                onPointerUp={handleGripPointerEnd}
                onPointerCancel={handleGripPointerCancel}
                aria-label={"Drag page"}
              >
                <Icon>
                  <LuGripVertical />
                </Icon>
              </Button>
            </Tooltip>
          ) : null}

          <iframe
            title={`preview-${page.id}`}
            srcDoc={page.previewHtml}
            sandbox=""
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              pointerEvents: "none",
              filter:
                isInteractionDisabled || isCoverExportDisabled
                  ? "blur(2.5px) grayscale(0.35) saturate(0.75) brightness(0.82)"
                  : "none",
              transition: "filter 0.2s ease",
            }}
          />

          {isInteractionDisabled || isCoverExportDisabled ? (
            <Box
              position={"absolute"}
              inset={0}
              pointerEvents={
                isCoverExportDisabled && !isInteractionDisabled
                  ? "auto"
                  : "none"
              }
              bg={"app.epub.overlay.preview"}
              cursor={
                isCoverExportDisabled && !isInteractionDisabled
                  ? "pointer"
                  : "default"
              }
              role={
                isCoverExportDisabled && !isInteractionDisabled
                  ? "button"
                  : undefined
              }
              tabIndex={
                isCoverExportDisabled && !isInteractionDisabled ? 0 : undefined
              }
              onClick={() => {
                if (!isCoverExportDisabled || isInteractionDisabled) return;
                onToggleCoverEnabled?.();
              }}
              onKeyDown={handleCoverDisabledOverlayKeyDown}
            >
              {isCoverExportDisabled ? (
                <Box
                  position={"absolute"}
                  inset={0}
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"center"}
                  px={3}
                >
                  <HStack
                    gap={1.5}
                    bg={"app.epub.bg.card"}
                    borderWidth={"1px"}
                    borderColor={"app.epub.border.default"}
                    rounded={"full"}
                    px={3}
                    py={1.5}
                  >
                    <Icon boxSize={3.5} color={"app.epub.fg.default"}>
                      <LuEyeOff />
                    </Icon>
                    <Text
                      fontFamily={"ui"}
                      fontSize={"xs"}
                      fontWeight={"semibold"}
                      color={"app.epub.fg.default"}
                      lineHeight={1.1}
                    >
                      Enable cover
                    </Text>
                  </HStack>
                </Box>
              ) : null}
            </Box>
          ) : null}

          {showGenerationStatus ? (
            <Box
              position={"absolute"}
              inset={0}
              display={"flex"}
              alignItems={"center"}
              justifyContent={"center"}
              pointerEvents={"none"}
              opacity={isGenerationStatusFading ? 0 : 1}
              transition={"opacity 0.3s ease"}
              zIndex={4}
            >
              <HStack
                gap={2}
                px={3}
                py={1.5}
                rounded={"full"}
                borderWidth={"1px"}
                borderColor={"app.epub.border.default"}
                bg={"app.epub.bg.card"}
                color={statusTextColor}
                boxShadow={"sm"}
              >
                <Icon
                  animation={
                    effectiveGenerationStatus === "processing"
                      ? "spin 1s linear infinite"
                      : undefined
                  }
                >
                  {effectiveGenerationStatus === "completed" ? (
                    <LuCheck />
                  ) : effectiveGenerationStatus === "processing" ? (
                    <LuLoaderCircle />
                  ) : (
                    <LuClock3 />
                  )}
                </Icon>
                <Text fontFamily={"ui"} fontSize={"xs"} fontWeight={"semibold"}>
                  {effectiveGenerationStatus === "completed"
                    ? "Processed"
                    : effectiveGenerationStatus === "processing"
                      ? "Processing..."
                      : "Pending"}
                </Text>
              </HStack>
            </Box>
          ) : null}
        </Box>
      </AspectRatio>

      {flashOverlayBg && flashKind ? (
        <Box
          position={"absolute"}
          inset={0}
          pointerEvents={"none"}
          bg={flashOverlayBg}
          opacity={flashOpacity}
          transition={"opacity 0.6s ease"}
          zIndex={6}
        />
      ) : null}
    </Box>
  );
}
