import {
  AspectRatio,
  Box,
  Button,
  FileUpload,
  HStack,
  Icon,
  Input,
  InputGroup,
  Text,
} from "@chakra-ui/react";
import { Tooltip } from "@components/ui/tooltip";
import {
  LuCheck,
  LuClipboardPaste,
  LuClock3,
  LuEye,
  LuEyeOff,
  LuGripVertical,
  LuLoaderCircle,
  LuRefreshCw,
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
import type { ChapterGenerationStatus, PageDraft } from "../types";

type DragPreviewAnchor = {
  clientX: number;
  clientY: number;
  offsetX: number;
  offsetY: number;
  width: number;
};

export function PageDraftCard({
  page,
  chapterNumber,
  isCover,
  hasCustomCover,
  isCoverEnabled,
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
  hasCustomCover?: boolean;
  isCoverEnabled?: boolean;
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
  const [flashKind, setFlashKind] = useState<"added" | "duplicate" | null>(null);
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
  const flashOverlayBg = flashColorBase ? `rgba(${flashColorBase}, 0.22)` : null;
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

  function buildDragAnchor(clientX: number, clientY: number): DragPreviewAnchor {
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
      Math.hypot(event.clientX - startPoint.x, event.clientY - startPoint.y) >= 8;
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

  function handleGripPointerCancel(event: ReactPointerEvent<HTMLButtonElement>) {
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
  const isRemoveDisabled = isInteractionDisabled || isCover;
  const isTitleDisabled = isInteractionDisabled || isCover;
  const canDrag = !isInteractionDisabled && !isCover;
  const isEffectiveCoverEnabled = isCoverEnabled ?? true;

  function handleCoverUploadChange(event: ChangeEvent<HTMLInputElement>) {
    if (!isCover || !onReplaceCoverFromFiles) return;
    const files = event.target.files;
    if (!files || files.length === 0) return;
    void onReplaceCoverFromFiles(files);
    event.target.value = "";
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
          <HStack h={"2.25rem"} px={2} justify={"space-between"} align={"center"}>
            <Text
              fontFamily={"ui"}
              fontSize={"sm"}
              fontWeight={"medium"}
              color={"app.epub.fg.default"}
            >
              Cover
            </Text>

            <HStack gap={0.5}>
              <FileUpload.Root maxFiles={1}>
                <FileUpload.HiddenInput
                  ref={coverUploadInputRef}
                  aria-label={"Upload cover image"}
                  accept={"image/*"}
                  onChange={handleCoverUploadChange}
                />
                <Tooltip content={"Upload cover"}>
                  <Button
                    size={"xs"}
                    variant={"ghost"}
                    onClick={() => coverUploadInputRef.current?.click()}
                    disabled={isInteractionDisabled}
                    aria-label={"Upload cover"}
                    minW={"auto"}
                    px={2}
                  >
                    <Icon>
                      <LuUpload />
                    </Icon>
                  </Button>
                </Tooltip>
              </FileUpload.Root>

              <Tooltip content={"Paste cover"}>
                <Button
                  size={"xs"}
                  variant={"ghost"}
                  onClick={() => void onReplaceCoverFromClipboard?.()}
                  disabled={isInteractionDisabled}
                  aria-label={"Paste cover"}
                  minW={"auto"}
                  px={2}
                >
                  <Icon>
                    <LuClipboardPaste />
                  </Icon>
                </Button>
              </Tooltip>

              <Tooltip content={"Reset cover"}>
                <Button
                  size={"xs"}
                  variant={"ghost"}
                  onClick={() => onResetCoverToAuto?.()}
                  disabled={isInteractionDisabled || !hasCustomCover}
                  aria-label={"Reset cover"}
                  minW={"auto"}
                  px={2}
                >
                  <Icon>
                    <LuRefreshCw />
                  </Icon>
                </Button>
              </Tooltip>

              <Tooltip
                content={
                  isEffectiveCoverEnabled ? "Disable cover" : "Enable cover"
                }
              >
                <Button
                  size={"xs"}
                  variant={"ghost"}
                  onClick={() => onToggleCoverEnabled?.()}
                  disabled={isInteractionDisabled}
                  aria-label={
                    isEffectiveCoverEnabled ? "Disable cover" : "Enable cover"
                  }
                  minW={"auto"}
                  px={2}
                >
                  <Icon>
                    {isEffectiveCoverEnabled ? <LuEyeOff /> : <LuEye />}
                  </Icon>
                </Button>
              </Tooltip>
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
        ratio={1 / 1.4142}
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
                isInteractionDisabled || (isCover && !isEffectiveCoverEnabled)
                  ? "blur(1px) grayscale(0.35) saturate(0.75) brightness(0.82)"
                  : "none",
              transition: "filter 0.2s ease",
            }}
          />

          {isInteractionDisabled || (isCover && !isEffectiveCoverEnabled) ? (
            <Box
              position={"absolute"}
              inset={0}
              pointerEvents={"none"}
              bg={"app.epub.overlay.preview"}
            >
              {isCover && !isEffectiveCoverEnabled ? (
                <Box
                  position={"absolute"}
                  inset={0}
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"center"}
                  px={3}
                >
                  <Text
                    fontFamily={"ui"}
                    fontSize={"xs"}
                    fontWeight={"semibold"}
                    color={"app.epub.fg.default"}
                    bg={"app.epub.bg.card"}
                    borderWidth={"1px"}
                    borderColor={"app.epub.border.default"}
                    rounded={"full"}
                    px={3}
                    py={1.5}
                  >
                    Cover disabled for export
                  </Text>
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
