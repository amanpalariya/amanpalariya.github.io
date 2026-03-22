import { Alert, Box, Code, Heading, Text, VStack } from "@chakra-ui/react";
import type { UseEpubMakerReturn } from "../hooks/useEpubMaker";
import { EpubToolbar } from "./EpubToolbar";
import { EpubMetadataForm } from "./EpubMetadataForm";
import { PasteFallbackPanel } from "./PasteFallbackPanel";
import { StatusAlerts } from "./StatusAlerts";
import { PageDraftGrid } from "./PageDraftGrid";

export function EpubMakerPageView(props: UseEpubMakerReturn) {
  return (
    <Box w={"full"} px={[4, 6]} py={4}>
      <VStack align={"stretch"} gap={4}>
        <Heading size={"2xl"}>EPUB Maker</Heading>
        <Text color={"fg.muted"}>
          Paste full HTML or plain text pages, preview as cards, then generate and
          download EPUB.
        </Text>

        <StatusAlerts
          showPasteFallback={props.showPasteFallback}
          summary={props.summary}
          errors={props.errors}
          warnings={props.warnings}
          generationProgress={props.generationProgress}
          onDismissWarnings={() => props.setWarnings([])}
        />

        <EpubToolbar
          isAdding={props.isAdding}
          isGenerating={props.isGenerating}
          pageCount={props.pages.length}
          showPasteFallback={props.showPasteFallback}
          onAddFromClipboard={props.addPageFromClipboard}
          onGenerate={props.generateEpub}
          onShowFallback={() => props.setShowPasteFallback(true)}
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

        {props.showPasteFallback ? (
          <PasteFallbackPanel
            pastedInput={props.pastedInput}
            onInputChange={props.setPastedInput}
            onPaste={props.onPasteInput}
            onAdd={props.addFromFallbackText}
            onHide={() => {
              props.setShowPasteFallback(false);
              props.setPastedInput("");
            }}
          />
        ) : null}

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
          onMoveUp={props.movePageUp}
          onMoveDown={props.movePageDown}
        />

        <Box>
          <Text fontSize={"xs"} color={"fg.muted"}>
            Output file: <Code>{props.effectiveFileName}</Code>
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
