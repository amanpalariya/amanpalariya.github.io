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
  useRef,
} from "react";
import { LuFilePlus, LuUpload } from "react-icons/lu";
import type {
  ChapterGenerationStatus,
  CoverSettingsState,
  CoverSizePresetId,
  CoverSizePresetOption,
  CoverTextColorMode,
  CoverTextPosition,
  CoverBackgroundId,
  CoverBackgroundOption,
  PageDraft,
} from "../types";
import { usePageGridDnd } from "../hooks/usePageGridDnd";
import { PageDraftCard } from "./PageDraftCard";
type PageFlashKind = "added" | "duplicate";
type PageFlashEntry = { kind: PageFlashKind; token: number };
const PAGE_PREVIEW_RATIO = 1 / 1.4142;

export function PageDraftGrid({
  pages,
  previewBookTitle,
  previewBookAuthor,
  coverPreviewHtml,
  coverCustomHtml,
  hasCustomCover,
  coverBackgroundId,
  coverBackgroundOptions,
  coverSizePresetId,
  coverSizePresetOptions,
  coverTextScalePercent,
  coverTextPosition,
  coverTextColorMode,
  hideCoverText,
  isCoverEnabled,
  isAdding,
  isGenerating,
  generationChapterStatusByPageId,
  activeGenerationPageId,
  isGenerationStatusFading,
  pageFlashById,
  onRemove,
  onRename,
  onReorder,
  onApplyCoverSettings,
  onAddFromClipboard,
  onAddFromFiles,
  pastedInput,
  onPastedInputChange,
  onPaste,
  onAddFromFallback,
}: {
  pages: PageDraft[];
  previewBookTitle: string;
  previewBookAuthor: string;
  coverPreviewHtml: string;
  coverCustomHtml: string | null;
  hasCustomCover: boolean;
  coverBackgroundId: CoverBackgroundId;
  coverBackgroundOptions: CoverBackgroundOption[];
  coverSizePresetId: CoverSizePresetId;
  coverSizePresetOptions: CoverSizePresetOption[];
  coverTextScalePercent: number;
  coverTextPosition: CoverTextPosition;
  coverTextColorMode: CoverTextColorMode;
  hideCoverText: boolean;
  isCoverEnabled: boolean;
  isAdding: boolean;
  isGenerating: boolean;
  generationChapterStatusByPageId: Record<string, ChapterGenerationStatus>;
  activeGenerationPageId: string | null;
  isGenerationStatusFading: boolean;
  pageFlashById: Record<string, PageFlashEntry>;
  onRemove: (id: string) => void;
  onRename: (id: string, value: string) => void;
  onReorder: (draggedId: string, targetIndex: number) => void;
  onApplyCoverSettings: (settings: CoverSettingsState) => void;
  onAddFromClipboard: () => Promise<void>;
  onAddFromFiles: (files: FileList | File[]) => Promise<void>;
  pastedInput: string;
  onPastedInputChange: (value: string) => void;
  onPaste: (event: ClipboardEvent<HTMLTextAreaElement>) => void;
  onAddFromFallback: () => void;
}) {
  const ghostUploadInputRef = useRef<HTMLInputElement | null>(null);
  const isInteractionDisabled = isGenerating;
  const isGenerationStatusVisible =
    isGenerating || Object.keys(generationChapterStatusByPageId).length > 0;
  const coverOffset = 1;
  const completedPageCount = Object.values(
    generationChapterStatusByPageId,
  ).filter((status) => status === "completed").length;
  const coverPage: PageDraft = {
    id: "__epub-cover__",
    title: "Cover",
    inputKind: "html",
    rawContent: "",
    baseUrl: null,
    previewHtml: coverPreviewHtml,
    createdAt: 0,
  };

  const {
    draggedId,
    dragPreviewAnchor,
    isGhostDropTarget,
    previewPages,
    handleGridDragOver,
    handleCoverSlotDragOver,
    handleCardSlotDragOver,
    handleDragStart,
    handleTouchDragStart,
    handleTouchDragMove,
    handleTouchDragEnd,
    handleTouchDragCancel,
    handleDragEnd,
    handleDrop,
    effectiveDropIndex,
    handleGhostDragOver,
    handleGhostDragLeave,
    handleGhostDrop,
  } = usePageGridDnd({
    pages,
    isInteractionDisabled,
    onReorder,
    onAddFromFiles,
    coverOffset,
  });

  function handleGhostUploadChange(event: ChangeEvent<HTMLInputElement>) {
    if (isInteractionDisabled) return;
    const files = event.target.files;
    if (!files || files.length === 0) return;
    void onAddFromFiles(files);
    event.target.value = "";
  }

  return (
    <Box position={"relative"}>
      <SimpleGrid
        columns={1}
        onDragOver={handleGridDragOver}
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
        <Box
          key={coverPage.id}
          data-drop-index={0}
          onDragOver={handleCoverSlotDragOver}
          onDrop={(event) => {
            if (isInteractionDisabled) return;
            event.preventDefault();
            handleDrop();
          }}
        >
          <PageDraftCard
            page={coverPage}
            previewBookTitle={previewBookTitle}
            previewBookAuthor={previewBookAuthor}
            chapterNumber={"C"}
            isCover={true}
            customCoverHtml={coverCustomHtml}
            hasCustomCover={hasCustomCover}
            isCoverEnabled={isCoverEnabled}
            selectedCoverBackgroundId={coverBackgroundId}
            coverBackgroundOptions={coverBackgroundOptions}
            selectedCoverSizePresetId={coverSizePresetId}
            coverSizePresetOptions={coverSizePresetOptions}
            coverTextScalePercent={coverTextScalePercent}
            coverTextPosition={coverTextPosition}
            coverTextColorMode={coverTextColorMode}
            hideCoverText={hideCoverText}
            onApplyCoverSettings={onApplyCoverSettings}
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
            isDropTarget={false}
            isInteractionDisabled={isInteractionDisabled}
            isGenerationStatusFading={isGenerationStatusFading}
            generationStatus={undefined}
          />
        </Box>

        {previewPages.map((page, index) => {
          const displayIndex = index + coverOffset;
          const isDraggedCard = draggedId === page.id;
          const isDropTarget = effectiveDropIndex(displayIndex) !== null;

          return (
            <Box
              key={page.id}
              data-drop-index={displayIndex}
              onDragOver={(event) => {
                handleCardSlotDragOver(event, page.id, displayIndex);
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
                onDragStart={(id, anchor) =>
                  handleDragStart(id, displayIndex, anchor)
                }
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
            handleGhostDragOver(event);
          }}
          onDragLeave={handleGhostDragLeave}
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

          <AspectRatio ratio={PAGE_PREVIEW_RATIO}>
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

      {draggedId && dragPreviewAnchor
        ? (() => {
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
                <Box bg={"app.epub.bg.card"}>
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
                        {pages.findIndex((page) => page.id === draggedPage.id) +
                          1}
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
                <AspectRatio
                  ratio={PAGE_PREVIEW_RATIO}
                  bg={"app.epub.bg.preview"}
                >
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
        : null}

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
