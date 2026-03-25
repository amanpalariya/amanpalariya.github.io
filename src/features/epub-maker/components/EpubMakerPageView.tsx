import { Box, Icon, Text, VStack } from "@chakra-ui/react";
import HighlightedSection from "@components/page/common/HighlightedSection";
import { useEffect, useState, type DragEvent } from "react";
import { LuFilePlus } from "react-icons/lu";
import type { UseEpubMakerReturn } from "../hooks/useEpubMaker";
import { EpubToolbar } from "./EpubToolbar";
import { EpubMetadataForm } from "./EpubMetadataForm";
import { PageDraftGrid } from "./PageDraftGrid";
import { TopRightNotifications } from "./TopRightNotifications";

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  if (target.isContentEditable) return true;

  const tagName = target.tagName.toLowerCase();
  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    return true;
  }

  return false;
}

export function EpubMakerPageView(props: UseEpubMakerReturn) {
  const [isFileDragOver, setIsFileDragOver] = useState(false);
  const [dragDepth, setDragDepth] = useState(0);

  useEffect(() => {
    function handleUndoRedoHotkeys(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) return;
      if (event.altKey) return;
      if (!event.metaKey && !event.ctrlKey) return;

      const key = event.key.toLowerCase();
      const isUndoKey = key === "z" && !event.shiftKey;
      const isRedoKey =
        (key === "z" && event.shiftKey) || (!event.metaKey && key === "y");

      if (isUndoKey) {
        if (!props.canUndo) return;
        event.preventDefault();
        props.undoPages();
        return;
      }

      if (isRedoKey) {
        if (!props.canRedo) return;
        event.preventDefault();
        props.redoPages();
      }
    }

    window.addEventListener("keydown", handleUndoRedoHotkeys);
    return () => {
      window.removeEventListener("keydown", handleUndoRedoHotkeys);
    };
  }, [props.canRedo, props.canUndo, props.redoPages, props.undoPages]);

  useEffect(() => {
    function handleWindowPaste(event: ClipboardEvent) {
      if (isEditableTarget(event.target)) return;
      props.onGlobalPaste(event);
    }

    window.addEventListener("paste", handleWindowPaste);
    return () => {
      window.removeEventListener("paste", handleWindowPaste);
    };
  }, [props.onGlobalPaste]);

  function hasFiles(event: DragEvent<HTMLElement>) {
    return Array.from(event.dataTransfer?.types ?? []).includes("Files");
  }

  function handleFileDragEnter(event: DragEvent<HTMLDivElement>) {
    if (!hasFiles(event)) return;
    event.preventDefault();
    setDragDepth((prev) => prev + 1);
    setIsFileDragOver(true);
  }

  function handleFileDragOver(event: DragEvent<HTMLDivElement>) {
    if (!hasFiles(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    if (!isFileDragOver) {
      setIsFileDragOver(true);
    }
  }

  function handleFileDragLeave(event: DragEvent<HTMLDivElement>) {
    if (!hasFiles(event)) return;
    event.preventDefault();
    setDragDepth((prev) => {
      const next = Math.max(0, prev - 1);
      if (next === 0) {
        setIsFileDragOver(false);
      }
      return next;
    });
  }

  function handleFileDrop(event: DragEvent<HTMLDivElement>) {
    if (!hasFiles(event)) return;
    event.preventDefault();
    setDragDepth(0);
    setIsFileDragOver(false);
    if (props.isGenerating) return;
    void props.addPagesFromFiles(event.dataTransfer.files);
  }

  return (
    <VStack align={"stretch"} gap={4} pt={4}>
      <TopRightNotifications
        notifications={props.notifications}
        onDismiss={props.dismissNotification}
      />

      <Box w={"full"} px={[4, 6]}>
        <VStack align={"stretch"} gap={4}>
          <EpubToolbar
            isAdding={props.isAdding}
            isGenerating={props.isGenerating}
            generationProgress={props.generationProgress}
            showDownloadCompleteIcon={props.showDownloadCompleteIcon}
            pageCount={props.pages.length}
            pastedInput={props.pastedInput}
            onAddFromClipboard={props.addPageFromClipboard}
            onAddFromFiles={props.addPagesFromFiles}
            onGenerate={props.generateEpub}
            onUndoPages={props.undoPages}
            onRedoPages={props.redoPages}
            canUndo={props.canUndo}
            canRedo={props.canRedo}
            onPastedInputChange={props.setPastedInput}
            onPaste={props.onPasteInput}
            onAddFromFallback={props.addFromFallbackText}
          />

          <EpubMetadataForm
            prefs={props.prefs}
            autoEpubFileName={props.autoEpubFileName}
            onTitleChange={props.setTitle}
            onAuthorChange={props.setAuthor}
            onManualFileNameChange={props.setManualFileName}
            onToggleFileNameMode={props.toggleFileNameMode}
            onEmbedRemoteImagesChange={props.setEmbedRemoteImages}
            onAllowExternalLinksChange={props.setAllowExternalLinks}
          />
        </VStack>
      </Box>

      <Box
        position={"relative"}
        onDragEnter={handleFileDragEnter}
        onDragOver={handleFileDragOver}
        onDragLeave={handleFileDragLeave}
        onDrop={handleFileDrop}
      >
        <HighlightedSection
          contentPx={{ base: 2, sm: 3, md: 4, lg: 6 }}
          contentPy={{ base: 2, sm: 3, md: 4, lg: 6 }}
        >
          <Box minH={"340px"} px={0} py={0}>
            <PageDraftGrid
              pages={props.pages}
              isAdding={props.isAdding}
              isGenerating={props.isGenerating}
              generationChapterStatusByPageId={props.generationChapterStatusByPageId}
              activeGenerationPageId={props.activeGenerationPageId}
              isGenerationStatusFading={props.isGenerationStatusFading}
              onRemove={props.removePage}
              onRename={props.renamePage}
              onReorder={props.reorderPages}
              onAddFromClipboard={props.addPageFromClipboard}
              onAddFromFiles={props.addPagesFromFiles}
              pastedInput={props.pastedInput}
              onPastedInputChange={props.setPastedInput}
              onPaste={props.onPasteInput}
              onAddFromFallback={props.addFromFallbackText}
            />
          </Box>
        </HighlightedSection>

        {props.isGenerating ? (
          <Box
            position={"absolute"}
            inset={0}
            rounded={"2xl"}
            bg={"app.epub.overlay.section"}
            backdropFilter={"blur(1.5px)"}
            pointerEvents={"none"}
            zIndex={1}
          />
        ) : null}

        {isFileDragOver ? (
          <Box
            position={"absolute"}
            inset={0}
            zIndex={3}
            rounded={"2xl"}
            borderWidth={"2px"}
            borderStyle={"dashed"}
            borderColor={"app.epub.border.accent"}
            bg={"app.epub.bg.preview"}
            opacity={0.82}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
            pointerEvents={"none"}
          >
            <VStack gap={2} color={"app.epub.fg.muted"} textAlign={"center"} px={4}>
              <Icon boxSize={8}>
                <LuFilePlus />
              </Icon>
              <Text fontFamily={"ui"} fontSize={"sm"} fontWeight={"semibold"}>
                Drop files to add pages
              </Text>
              <Text fontFamily={"ui"} fontSize={"xs"} color={"app.epub.fg.subtle"}>
                Supports Markdown, text, HTML, and image files.
              </Text>
            </VStack>
          </Box>
        ) : null}
      </Box>
    </VStack>
  );
}
