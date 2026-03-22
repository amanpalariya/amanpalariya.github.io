import { Alert, Box, Heading, Text, VStack } from "@chakra-ui/react";
import type { UseEpubMakerReturn } from "../hooks/useEpubMaker";
import { EpubToolbar } from "./EpubToolbar";
import { EpubMetadataForm } from "./EpubMetadataForm";
import { PageDraftGrid } from "./PageDraftGrid";
import { TopRightNotifications } from "./TopRightNotifications";

export function EpubMakerPageView(props: UseEpubMakerReturn) {
  return (
    <Box w={"full"} px={[4, 6]} py={4}>
      <VStack align={"stretch"} gap={4}>
        <TopRightNotifications
          notifications={props.notifications}
          onDismiss={props.dismissNotification}
        />

        <Heading size={"2xl"}>EPUB Maker</Heading>
        <Text color={"fg.muted"}>
          Paste full HTML documents or raw text directly, organize pages, and
          export a clean EPUB.
        </Text>

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

        {props.pages.length === 0 ? (
          <Alert.Root status={"info"}>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>
                No pages yet. Add the first page from clipboard to start.
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
        ) : null}

        <PageDraftGrid
          pages={props.pages}
          onRemove={props.removePage}
          onRename={props.renamePage}
          onReorder={props.reorderPages}
        />
      </VStack>
    </Box>
  );
}
