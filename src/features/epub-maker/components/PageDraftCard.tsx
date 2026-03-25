import {
  AspectRatio,
  Box,
  Button,
  HStack,
  Icon,
  Input,
  InputGroup,
  Text,
} from "@chakra-ui/react";
import { Tooltip } from "@components/ui/tooltip";
import { LuCheck, LuClock3, LuLoaderCircle, LuTrash2 } from "react-icons/lu";
import { useEffect, useState, type DragEvent, type KeyboardEvent } from "react";
import type { ChapterGenerationStatus, PageDraft } from "../types";

export function PageDraftCard({
  page,
  chapterNumber,
  onRemove,
  onRename,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragging,
  isDropTarget,
  isInteractionDisabled,
  isGenerationStatusFading,
  generationStatus,
}: {
  page: PageDraft;
  chapterNumber: number;
  onRemove: (id: string) => void;
  onRename: (id: string, value: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: () => void;
  isDragging: boolean;
  isDropTarget: boolean;
  isInteractionDisabled: boolean;
  isGenerationStatusFading: boolean;
  generationStatus?: ChapterGenerationStatus;
}) {
  const [titleDraft, setTitleDraft] = useState(page.title);
  const effectiveGenerationStatus = generationStatus ?? "pending";
  const showGenerationStatus = generationStatus !== undefined;
  const statusTextColor =
    effectiveGenerationStatus === "completed"
      ? "app.epub.fg.status.completed"
      : effectiveGenerationStatus === "processing"
        ? "app.epub.fg.status.processing"
        : "app.epub.fg.status.pending";

  useEffect(() => {
    setTitleDraft(page.title);
  }, [page.title]);

  function commitRenameIfChanged() {
    if (titleDraft === page.title) return;
    onRename(page.id, titleDraft);
  }

  function handleTitleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.currentTarget.blur();
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

  return (
    <Box
      w={"full"}
      borderWidth={isDropTarget ? "2px" : "1px"}
      borderStyle={isDropTarget ? "dashed" : "solid"}
      borderColor={
        isDropTarget ? "app.epub.border.accent" : "app.epub.border.default"
      }
      rounded={"2xl"}
      overflow={"hidden"}
      bg={"app.epub.bg.card"}
      opacity={isDragging ? 0.6 : 1}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <Box borderBottomWidth={"1px"} borderColor={"app.epub.border.muted"}>
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
                disabled={isInteractionDisabled}
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
            disabled={isInteractionDisabled}
            onChange={(event) => setTitleDraft(event.target.value)}
            onBlur={commitRenameIfChanged}
            onKeyDown={handleTitleKeyDown}
          />
        </InputGroup>
      </Box>
      <AspectRatio
        position={"relative"}
        ratio={1 / 1.4142}
        bg={"app.epub.bg.preview"}
        cursor={isInteractionDisabled ? "default" : "grab"}
        draggable={!isInteractionDisabled}
        onDragStart={() => onDragStart(page.id)}
        onDragEnd={onDragEnd}
      >
        <Box position={"relative"} w={"full"} h={"full"}>
          <iframe
            title={`preview-${page.id}`}
            srcDoc={page.previewHtml}
            sandbox=""
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              pointerEvents: "none",
              filter: isInteractionDisabled
                ? "blur(1px) grayscale(0.35) saturate(0.75) brightness(0.82)"
                : "none",
              transition: "filter 0.2s ease",
            }}
          />

          {isInteractionDisabled ? (
            <Box
              position={"absolute"}
              inset={0}
              pointerEvents={"none"}
              bg={"app.epub.overlay.preview"}
            />
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
    </Box>
  );
}
