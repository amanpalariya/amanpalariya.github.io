import {
  AspectRatio,
  Box,
  Button,
  FileUpload,
  HStack,
  Icon,
  SimpleGrid,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import {
  type ChangeEvent,
  type ClipboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { LuFilePlus, LuUpload } from "react-icons/lu";
import type { ChapterGenerationStatus, PageDraft } from "../types";
import { PageDraftCard } from "./PageDraftCard";
type PageFlashKind = "added" | "duplicate";
type PageFlashEntry = { kind: PageFlashKind; token: number };
type DragPreviewAnchor = {
  clientX: number;
  clientY: number;
  offsetX: number;
  offsetY: number;
  width: number;
};
type DragMode = "mouse" | "touch" | null;

export function PageDraftGrid({
  pages,
  coverEnabled,
  coverPreviewHtml,
  isAdding,
  isGenerating,
  generationChapterStatusByPageId,
  activeGenerationPageId,
  isGenerationStatusFading,
  pageFlashById,
  onRemove,
  onRename,
  onReorder,
  onAddFromClipboard,
  onAddFromFiles,
  pastedInput,
  onPastedInputChange,
  onPaste,
  onAddFromFallback,
}: {
  pages: PageDraft[];
  coverEnabled: boolean;
  coverPreviewHtml: string;
  isAdding: boolean;
  isGenerating: boolean;
  generationChapterStatusByPageId: Record<string, ChapterGenerationStatus>;
  activeGenerationPageId: string | null;
  isGenerationStatusFading: boolean;
  pageFlashById: Record<string, PageFlashEntry>;
  onRemove: (id: string) => void;
  onRename: (id: string, value: string) => void;
  onReorder: (draggedId: string, targetIndex: number) => void;
  onAddFromClipboard: () => Promise<void>;
  onAddFromFiles: (files: FileList | File[]) => Promise<void>;
  pastedInput: string;
  onPastedInputChange: (value: string) => void;
  onPaste: (event: ClipboardEvent<HTMLTextAreaElement>) => void;
  onAddFromFallback: () => void;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [isGhostDropTarget, setIsGhostDropTarget] = useState(false);
  const [dragPreviewAnchor, setDragPreviewAnchor] =
    useState<DragPreviewAnchor | null>(null);
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const ghostUploadInputRef = useRef<HTMLInputElement | null>(null);
  const draggedIdRef = useRef<string | null>(null);
  const dropIndexRef = useRef<number | null>(null);
  const touchMoveRafRef = useRef<number | null>(null);
  const pendingTouchPointRef = useRef<{ x: number; y: number } | null>(null);
  const isInteractionDisabled = isGenerating;
  const isGenerationStatusVisible =
    isGenerating || Object.keys(generationChapterStatusByPageId).length > 0;
  const coverOffset = coverEnabled ? 1 : 0;
  const totalDisplayItemCount = pages.length + coverOffset;
  const completedPageCount = Object.values(
    generationChapterStatusByPageId,
  ).filter((status) => status === "completed").length;
  const coverPage: PageDraft | null = coverEnabled
    ? {
        id: "__epub-cover__",
        title: "Cover",
        inputKind: "html",
        rawContent: "",
        baseUrl: null,
        previewHtml: coverPreviewHtml,
        createdAt: 0,
      }
    : null;

  function handleGhostUploadChange(event: ChangeEvent<HTMLInputElement>) {
    if (isInteractionDisabled) return;
    const files = event.target.files;
    if (!files || files.length === 0) return;
    void onAddFromFiles(files);
    event.target.value = "";
  }

  const dragIndex =
    draggedId == null ? -1 : pages.findIndex((page) => page.id === draggedId);

  const previewPages =
    dragMode === "mouse" && draggedId && dropIndex !== null && dragIndex >= 0
      ? (() => {
          const draggedPage = pages[dragIndex];
          const remaining = pages.filter((page) => page.id !== draggedId);
          const targetChapterIndex = coverEnabled
            ? Math.max(0, dropIndex - 1)
            : dropIndex;
          const insertionIndex = Math.max(
            0,
            Math.min(targetChapterIndex, remaining.length),
          );
          const next = [...remaining];
          next.splice(insertionIndex, 0, draggedPage);
          return next;
        })()
      : pages;

  function handleDrop() {
    if (isInteractionDisabled) return;
    const activeDraggedId = draggedIdRef.current ?? draggedId;
    if (!activeDraggedId) return;
    const targetDisplayIndex =
      dropIndexRef.current ??
      dropIndex ??
      (dragIndex >= 0 ? dragIndex + coverOffset : 0);
    const targetIndex = coverEnabled
      ? Math.max(0, targetDisplayIndex - 1)
      : targetDisplayIndex;
    onReorder(activeDraggedId, targetIndex);
    setDraggedId(null);
    setDropIndex(null);
    setDragMode(null);
    draggedIdRef.current = null;
    dropIndexRef.current = null;
  }

  function handleDragEnd() {
    setDraggedId(null);
    setDropIndex(null);
    setDragMode(null);
    draggedIdRef.current = null;
    dropIndexRef.current = null;
    setDragPreviewAnchor(null);
    setIsGhostDropTarget(false);
    pendingTouchPointRef.current = null;
    if (touchMoveRafRef.current != null) {
      window.cancelAnimationFrame(touchMoveRafRef.current);
      touchMoveRafRef.current = null;
    }
  }

  function updateDropIndexFromPoint(clientX: number, clientY: number) {
    const hitTarget = document.elementFromPoint(clientX, clientY) as
      | HTMLElement
      | null;
    const dropIndexElement = hitTarget?.closest<HTMLElement>("[data-drop-index]");
    if (dropIndexElement?.dataset.dropIndex) {
      const nextIndex = Number(dropIndexElement.dataset.dropIndex);
      if (!Number.isNaN(nextIndex)) {
        setDropIndex(nextIndex);
        dropIndexRef.current = nextIndex;
      }
      return;
    }

    const isOverGhost = Boolean(hitTarget?.closest("[data-ghost-drop-target]"));
    if (isOverGhost) {
      setDropIndex(totalDisplayItemCount);
      dropIndexRef.current = totalDisplayItemCount;
      setIsGhostDropTarget(true);
      return;
    }
    setIsGhostDropTarget(false);
  }

  function maybeAutoScroll(clientY: number) {
    const edgeThreshold = 64;
    const scrollStep = 14;
    if (clientY < edgeThreshold) {
      window.scrollBy(0, -scrollStep);
      return;
    }
    if (clientY > window.innerHeight - edgeThreshold) {
      window.scrollBy(0, scrollStep);
    }
  }

  function handleTouchDragStart(id: string, anchor: DragPreviewAnchor) {
    if (isInteractionDisabled) return;
    const currentIndex = pages.findIndex((page) => page.id === id);
    if (currentIndex < 0) return;
    setDraggedId(id);
    setDropIndex(currentIndex + coverOffset);
    setDragMode("touch");
    draggedIdRef.current = id;
    dropIndexRef.current = currentIndex + coverOffset;
    setDragPreviewAnchor(anchor);
    updateDropIndexFromPoint(anchor.clientX, anchor.clientY);
  }

  function handleTouchDragMove(clientX: number, clientY: number) {
    if (!draggedIdRef.current) return;
    pendingTouchPointRef.current = { x: clientX, y: clientY };
    if (touchMoveRafRef.current != null) return;
    touchMoveRafRef.current = window.requestAnimationFrame(() => {
      touchMoveRafRef.current = null;
      const point = pendingTouchPointRef.current;
      if (!point) return;
      setDragPreviewAnchor((prev) =>
        prev
          ? {
              ...prev,
              clientX: point.x,
              clientY: point.y,
            }
          : prev,
      );
      updateDropIndexFromPoint(point.x, point.y);
      maybeAutoScroll(point.y);
    });
  }

  function handleTouchDragEnd() {
    if (isInteractionDisabled) return;
    const activeDraggedId = draggedIdRef.current ?? draggedId;
    if (!activeDraggedId) return;
    const targetDisplayIndex =
      dropIndexRef.current ??
      dropIndex ??
      (dragIndex >= 0 ? dragIndex + coverOffset : 0);
    const targetIndex = coverEnabled
      ? Math.max(0, targetDisplayIndex - 1)
      : targetDisplayIndex;
    onReorder(activeDraggedId, targetIndex);
    handleDragEnd();
  }

  function handleTouchDragCancel() {
    handleDragEnd();
  }

  useEffect(() => {
    return () => {
      if (touchMoveRafRef.current != null) {
        window.cancelAnimationFrame(touchMoveRafRef.current);
      }
    };
  }, []);

  function effectiveDropIndex(index: number) {
    if (!draggedId) return null;
    return dropIndex === index ? index : null;
  }

  async function handleGhostDrop(files: FileList | null) {
    if (isInteractionDisabled) return;
    setIsGhostDropTarget(false);
    if (!files || files.length === 0) return;
    await onAddFromFiles(files);
  }

  return (
    <Box position={"relative"}>
      <SimpleGrid
        columns={1}
        onDragOver={(event) => {
          if (!draggedId || !dragPreviewAnchor) return;
          if (event.clientX <= 0 && event.clientY <= 0) return;
          setDragPreviewAnchor((prev) =>
            prev
              ? {
                  ...prev,
                  clientX: event.clientX,
                  clientY: event.clientY,
                }
              : prev,
          );
        }}
        css={{
          "@media (min-width: 360px)": {
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          },
          "@media (min-width: 620px)": {
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          },
        }}
        gap={2}
        alignItems={"start"}
      >
        {coverPage ? (
          <Box
            key={coverPage.id}
            data-drop-index={0}
            onDragOver={(event) => {
              if (isInteractionDisabled) return;
              event.preventDefault();
              if (!draggedId) return;
              setDropIndex(0);
              dropIndexRef.current = 0;
            }}
            onDrop={(event) => {
              if (isInteractionDisabled) return;
              event.preventDefault();
              handleDrop();
            }}
          >
            <PageDraftCard
              page={coverPage}
              chapterNumber={"C"}
              isCover={true}
              onRemove={onRemove}
              onRename={onRename}
              onDragStart={() => {}}
              onTouchDragStart={() => {}}
              onTouchDragMove={() => {}}
              onTouchDragEnd={() => {}}
              onTouchDragCancel={() => {}}
              onDragEnd={isInteractionDisabled ? () => {} : handleDragEnd}
              onDragOver={(event) => {
                if (isInteractionDisabled) return;
                event.preventDefault();
              }}
              onDrop={handleDrop}
              isDragging={false}
              isDropTarget={!isInteractionDisabled && effectiveDropIndex(0) !== null}
              isInteractionDisabled={isInteractionDisabled}
              isGenerationStatusFading={isGenerationStatusFading}
              generationStatus={undefined}
            />
          </Box>
        ) : null}

        {previewPages.map((page, index) => {
          const displayIndex = index + coverOffset;
          const isDraggedCard = draggedId === page.id;
          const isDropTarget = effectiveDropIndex(displayIndex) !== null;

          return (
            <Box
              key={page.id}
              data-drop-index={displayIndex}
              onDragOver={(event) => {
                if (isInteractionDisabled) return;
                event.preventDefault();
                if (!draggedId) return;
                if (draggedId === page.id) return;
                setDropIndex(displayIndex);
                dropIndexRef.current = displayIndex;
              }}
              onDrop={(event) => {
                if (isInteractionDisabled) return;
                event.preventDefault();
                handleDrop();
              }}
            >
              <PageDraftCard
                page={page}
                chapterNumber={index + 1}
                onRemove={onRemove}
                onRename={onRename}
                onDragStart={(id, anchor) => {
                  if (isInteractionDisabled) return;
                  setDraggedId(id);
                  setDropIndex(displayIndex);
                  setDragMode("mouse");
                  draggedIdRef.current = id;
                  dropIndexRef.current = displayIndex;
                  setDragPreviewAnchor(anchor);
                }}
                onTouchDragStart={handleTouchDragStart}
                onTouchDragMove={handleTouchDragMove}
                onTouchDragEnd={handleTouchDragEnd}
                onTouchDragCancel={handleTouchDragCancel}
                onDragEnd={isInteractionDisabled ? () => {} : handleDragEnd}
                onDragOver={(event) => {
                  if (isInteractionDisabled) return;
                  event.preventDefault();
                }}
                onDrop={handleDrop}
                isDragging={!isInteractionDisabled && isDraggedCard}
                isDropTarget={!isInteractionDisabled && isDropTarget}
                isInteractionDisabled={isInteractionDisabled}
                isGenerationStatusFading={isGenerationStatusFading}
                pageFlashKind={pageFlashById[page.id]?.kind}
                pageFlashToken={pageFlashById[page.id]?.token}
                generationStatus={
                  isGenerationStatusVisible
                    ? (generationChapterStatusByPageId[page.id] ??
                      (activeGenerationPageId === page.id
                        ? "processing"
                        : "pending"))
                    : undefined
                }
              />
            </Box>
          );
        })}

        <Box
          data-ghost-drop-target={true}
          w={"full"}
          borderWidth={isGhostDropTarget ? "3px" : "2px"}
          borderStyle={"dashed"}
          borderColor={
            isGhostDropTarget
              ? "app.epub.border.accent"
              : "app.epub.border.default"
          }
          rounded={"2xl"}
          overflow={"hidden"}
          bg={"app.epub.bg.preview"}
          transition={"all 0.2s ease"}
          _hover={{
            borderColor: isInteractionDisabled
              ? "app.epub.border.default"
              : "app.epub.border.accent",
          }}
          onDragOver={(event) => {
            if (isInteractionDisabled) return;
            event.preventDefault();
            setIsGhostDropTarget(true);
            dropIndexRef.current = totalDisplayItemCount;
          }}
          onDragLeave={(event) => {
            const nextTarget = event.relatedTarget as Node | null;
            if (nextTarget && event.currentTarget.contains(nextTarget)) return;
            setIsGhostDropTarget(false);
          }}
          onDrop={(event) => {
            if (isInteractionDisabled) return;
            event.preventDefault();
            event.stopPropagation();
            void handleGhostDrop(event.dataTransfer.files);
          }}
        >
          <Box borderBottomWidth={"1px"} borderColor={"app.epub.border.muted"}>
            <FileUpload.Root maxFiles={50}>
              <FileUpload.HiddenInput
                ref={ghostUploadInputRef}
                aria-label={"Upload files"}
                onChange={handleGhostUploadChange}
              />
              <Button
                size={"sm"}
                w={"full"}
                rounded={"none"}
                m={0}
                display={"inline-flex"}
                justifyContent={"center"}
                gap={1.5}
                variant={"subtle"}
                loading={isAdding}
                disabled={isInteractionDisabled}
                onClick={() => ghostUploadInputRef.current?.click()}
                bg={"app.epub.button.subtle.bg"}
                color={"app.epub.button.subtle.fg"}
                _hover={{ bg: "app.epub.button.subtle.hoverBg" }}
              >
                <Icon>
                  <LuUpload />
                </Icon>
                Upload files
              </Button>
            </FileUpload.Root>
          </Box>

          <AspectRatio ratio={1 / 1.4142}>
            <Box
              h={"full"}
              display={"flex"}
              flexDirection={"column"}
              overflow={"hidden"}
            >
              <VStack
                flex={1}
                minH={0}
                overflow={"hidden"}
                align={"center"}
                justify={"center"}
                gap={2}
                py={2}
                color={"app.epub.fg.subtle"}
                opacity={0.9}
                textAlign={"center"}
                px={4}
                cursor={
                  isInteractionDisabled || isAdding ? "not-allowed" : "pointer"
                }
                onClick={() => {
                  if (isInteractionDisabled || isAdding) return;
                  void onAddFromClipboard();
                }}
              >
                <Icon boxSize={8}>
                  <LuFilePlus />
                </Icon>
                <Text fontFamily={"ui"} fontSize={"xs"} fontWeight={"semibold"}>
                  Add page
                </Text>
                <Text
                  fontFamily={"ui"}
                  fontSize={"xs"}
                  color={"app.epub.fg.subtle"}
                  lineClamp={2}
                >
                  Click to import clipboard content, or drop files.
                </Text>
              </VStack>

              <Box
                w={"full"}
                flex={"0 0 40%"}
                mt={"auto"}
                minH={0}
                borderTopWidth={"1px"}
                borderColor={"app.epub.border.muted"}
                display={"flex"}
                flexDirection={"column"}
              >
                <Textarea
                  value={pastedInput}
                  onChange={(event) => onPastedInputChange(event.target.value)}
                  onPaste={onPaste}
                  disabled={isInteractionDisabled}
                  w={"full"}
                  flex={1}
                  minH={0}
                  rounded={"none"}
                  borderWidth={0}
                  resize={"none"}
                  bg={"app.epub.bg.card"}
                  color={"app.epub.fg.default"}
                  _placeholder={{ color: "app.epub.fg.subtle" }}
                  placeholder={"Paste HTML, text, or image here"}
                />
                <Button
                  size={"xs"}
                  w={"full"}
                  rounded={"none"}
                  mt={0}
                  variant={"subtle"}
                  onClick={onAddFromFallback}
                  disabled={isInteractionDisabled}
                  bg={"app.epub.button.subtle.bg"}
                  color={"app.epub.button.subtle.fg"}
                  _hover={{ bg: "app.epub.button.subtle.hoverBg" }}
                >
                  Add pasted content
                </Button>
              </Box>
            </Box>
          </AspectRatio>
        </Box>
      </SimpleGrid>

      {draggedId && dragPreviewAnchor ? (
        (() => {
          const draggedPage = pages.find((page) => page.id === draggedId);
          if (!draggedPage) return null;

          return (
            <Box
              position={"fixed"}
              left={`${dragPreviewAnchor.clientX - dragPreviewAnchor.offsetX}px`}
              top={`${dragPreviewAnchor.clientY - dragPreviewAnchor.offsetY}px`}
              w={`${dragPreviewAnchor.width}px`}
              pointerEvents={"none"}
              zIndex={30}
              opacity={0.95}
              borderWidth={"1px"}
              borderColor={"app.epub.border.accent"}
              rounded={"2xl"}
              overflow={"hidden"}
              bg={"app.epub.bg.card"}
              boxShadow={"2xl"}
            >
              <Box
                bg={"app.epub.bg.card"}
              >
                <HStack
                  h={"2rem"}
                  gap={2}
                  px={2}
                  align={"center"}
                  borderBottomWidth={"1px"}
                  borderColor={"app.epub.border.muted"}
                >
                  <Box
                    minW={"2.25rem"}
                    display={"flex"}
                    alignItems={"center"}
                    justifyContent={"center"}
                  >
                    <Text
                      fontFamily={"ui"}
                      fontSize={"xs"}
                      fontWeight={"semibold"}
                      color={"app.epub.fg.muted"}
                    >
                      {pages.findIndex((page) => page.id === draggedPage.id) + 1}
                    </Text>
                  </Box>
                  <Text
                    flex={1}
                    fontFamily={"ui"}
                    fontSize={"sm"}
                    color={"app.epub.fg.default"}
                    lineClamp={1}
                  >
                    {draggedPage.title}
                  </Text>
                </HStack>
              </Box>
              <AspectRatio ratio={1 / 1.4142} bg={"app.epub.bg.preview"}>
                <iframe
                  title={`drag-preview-${draggedPage.id}`}
                  srcDoc={draggedPage.previewHtml}
                  sandbox=""
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    pointerEvents: "none",
                  }}
                />
              </AspectRatio>
            </Box>
          );
        })()
      ) : null}

      {isInteractionDisabled ? (
        <Box
          position={"absolute"}
          inset={0}
          pointerEvents={"none"}
          display={"flex"}
          alignItems={"flex-start"}
          justifyContent={"center"}
          pt={2}
          zIndex={2}
        >
          <HStack
            gap={1.5}
            px={3}
            py={1.5}
            rounded={"full"}
            borderWidth={"1px"}
            borderColor={"app.epub.border.default"}
            bg={"app.epub.bg.card"}
            color={"app.epub.fg.muted"}
            boxShadow={"sm"}
          >
            <Text fontFamily={"ui"} fontSize={"xs"} fontWeight={"semibold"}>
              {completedPageCount}/{pages.length} pages processed
            </Text>
          </HStack>
        </Box>
      ) : null}
    </Box>
  );
}
