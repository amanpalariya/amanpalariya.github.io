import { Box, Icon, Text, VStack } from "@chakra-ui/react";
import HighlightedSection from "@components/page/common/HighlightedSection";
import { useState, type DragEvent } from "react";
import { LuFilePlus } from "react-icons/lu";
import type { UseEpubMakerReturn } from "../hooks/useEpubMaker";
import { EpubToolbar } from "./EpubToolbar";
import { EpubMetadataForm } from "./EpubMetadataForm";
import { PageDraftGrid } from "./PageDraftGrid";
import { TopRightNotifications } from "./TopRightNotifications";

export function EpubMakerPageView(props: UseEpubMakerReturn) {
  const [isFileDragOver, setIsFileDragOver] = useState(false);
  const [dragDepth, setDragDepth] = useState(0);

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
            pageCount={props.pages.length}
            pastedInput={props.pastedInput}
            onAddFromClipboard={props.addPageFromClipboard}
            onGenerate={props.generateEpub}
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
        <HighlightedSection>
          <Box minH={"340px"} px={0} py={4}>
            <PageDraftGrid
              pages={props.pages}
              isAdding={props.isAdding}
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

        {isFileDragOver ? (
          <Box
            position={"absolute"}
            inset={0}
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
                Supports text, HTML, and image files.
              </Text>
            </VStack>
          </Box>
        ) : null}
      </Box>
    </VStack>
  );
}
