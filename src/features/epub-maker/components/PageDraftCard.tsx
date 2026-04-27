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
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type {
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

export function PageDraftCard({
  page,
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
                              md: "minmax(0, 1fr) minmax(0, 1fr)",
                            }}
                          >
                            <Box>
                              <Text
                                fontSize={"sm"}
                                color={"app.epub.fg.muted"}
                                mb={1}
                              >
                                Cover template / theme
                              </Text>
                              <NativeSelect.Root
                                {...dialogFieldProps}
                                size={"md"}
                                disabled={
                                  isInteractionDisabled ||
                                  !selectedCoverTemplateId ||
                                  !coverTemplateOptions ||
                                  coverTemplateOptions.length === 0
                                }
                              >
                                <NativeSelect.Field
                                  fontFamily={"ui"}
                                  fontSize={"sm"}
                                  rounded={"lg"}
                                  value={selectedCoverTemplateId ?? ""}
                                  aria-label={"Select cover template"}
                                  onChange={(event) =>
                                    onCoverTemplateChange?.(
                                      event.currentTarget
                                        .value as CoverTemplateId,
                                    )
                                  }
                                >
                                  {(coverTemplateOptions ?? []).map(
                                    (option) => (
                                      <option
                                        key={option.id}
                                        value={option.id}
                                        disabled={option.id === "custom"}
                                      >
                                        {option.label}
                                      </option>
                                    ),
                                  )}
                                </NativeSelect.Field>
                                <NativeSelect.Indicator />
                              </NativeSelect.Root>
                            </Box>

                            <Box>
                              <Text
                                fontSize={"sm"}
                                color={"app.epub.fg.muted"}
                                mb={1}
                              >
                                Common cover sizes
                              </Text>
                              <NativeSelect.Root
                                {...dialogFieldProps}
                                size={"md"}
                                disabled={
                                  isInteractionDisabled ||
                                  !selectedCoverSizePresetId ||
                                  !coverSizePresetOptions ||
                                  coverSizePresetOptions.length === 0
                                }
                              >
                                <NativeSelect.Field
                                  fontFamily={"ui"}
                                  fontSize={"sm"}
                                  rounded={"lg"}
                                  value={selectedCoverSizePresetId ?? ""}
                                  aria-label={"Select cover size preset"}
                                  onChange={(event) =>
                                    onCoverSizePresetChange?.(
                                      event.currentTarget
                                        .value as CoverSizePresetId,
                                    )
                                  }
                                >
                                  {(coverSizePresetOptions ?? []).map(
                                    (option) => (
                                      <option key={option.id} value={option.id}>
                                        {option.label} · {option.description}
                                      </option>
                                    ),
                                  )}
                                </NativeSelect.Field>
                                <NativeSelect.Indicator />
                              </NativeSelect.Root>
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
                                              rounded={"md"}
                                              borderWidth={
                                                isSelected ? "2px" : "1px"
                                              }
                                              borderColor={
                                                isSelected
                                                  ? "app.epub.border.accent"
                                                  : "app.epub.border.default"
                                              }
                                              bg={"app.epub.bg.preview"}
                                              position={"relative"}
                                              overflow={"hidden"}
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
                                            </Box>
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
