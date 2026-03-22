import { Box, EmptyState, Icon, VStack } from "@chakra-ui/react";
import HighlightedSection from "@components/page/common/HighlightedSection";
import { LuFilePlus } from "react-icons/lu";
import type { UseEpubMakerReturn } from "../hooks/useEpubMaker";
import { EpubToolbar } from "./EpubToolbar";
import { EpubMetadataForm } from "./EpubMetadataForm";
import { PageDraftGrid } from "./PageDraftGrid";
import { TopRightNotifications } from "./TopRightNotifications";

export function EpubMakerPageView(props: UseEpubMakerReturn) {
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

      <HighlightedSection>
        {props.pages.length === 0 ? (
          <Box
            minH={"340px"}
            my={4}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
          >
            <EmptyState.Root>
              <EmptyState.Content>
                <EmptyState.Indicator>
                  <Icon boxSize={12}>
                    <LuFilePlus />
                  </Icon>
                </EmptyState.Indicator>
                <EmptyState.Title textAlign={"center"}>
                  No pages added!
                </EmptyState.Title>
              </EmptyState.Content>
            </EmptyState.Root>
          </Box>
        ) : (
          <Box minH={"340px"} px={0} py={4}>
            <PageDraftGrid
              pages={props.pages}
              onRemove={props.removePage}
              onRename={props.renamePage}
              onReorder={props.reorderPages}
            />
          </Box>
        )}
      </HighlightedSection>
    </VStack>
  );
}
