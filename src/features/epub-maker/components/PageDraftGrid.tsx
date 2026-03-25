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
import { type ChangeEvent, type ClipboardEvent, useRef, useState } from "react";
import { LuFilePlus, LuUpload } from "react-icons/lu";
import type { ChapterGenerationStatus, PageDraft } from "../types";
import { PageDraftCard } from "./PageDraftCard";
type PageFlashKind = "added" | "duplicate";
type PageFlashEntry = { kind: PageFlashKind; token: number };

export function PageDraftGrid({
  pages,
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
  const ghostUploadInputRef = useRef<HTMLInputElement | null>(null);
  const isInteractionDisabled = isGenerating;
  const isGenerationStatusVisible =
    isGenerating || Object.keys(generationChapterStatusByPageId).length > 0;
  const completedPageCount = Object.values(
    generationChapterStatusByPageId,
  ).filter((status) => status === "completed").length;

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
    draggedId && dropIndex !== null && dragIndex >= 0
      ? (() => {
          const draggedPage = pages[dragIndex];
          const remaining = pages.filter((page) => page.id !== draggedId);
          const insertionIndex = Math.max(
            0,
            Math.min(dropIndex, remaining.length),
          );
          const next = [...remaining];
          next.splice(insertionIndex, 0, draggedPage);
          return next;
        })()
      : pages;

  function handleDrop() {
    if (isInteractionDisabled) return;
    if (!draggedId) return;
    onReorder(draggedId, dropIndex ?? dragIndex);
    setDraggedId(null);
    setDropIndex(null);
  }

  function handleDragEnd() {
    setDraggedId(null);
    setDropIndex(null);
    setIsGhostDropTarget(false);
  }

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
        {previewPages.map((page, index) => {
          const isDraggedCard = draggedId === page.id;
          const isDropTarget = effectiveDropIndex(index) !== null;

          return (
            <Box
              key={page.id}
              onDragOver={(event) => {
                if (isInteractionDisabled) return;
                event.preventDefault();
                if (!draggedId) return;
                if (draggedId === page.id) return;
                setDropIndex(index);
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
                onDragStart={(id) => {
                  if (isInteractionDisabled) return;
                  setDraggedId(id);
                  setDropIndex(index);
                }}
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
