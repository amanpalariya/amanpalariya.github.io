import { Box, Button, Icon, Input, InputGroup } from "@chakra-ui/react";
import { Tooltip } from "@components/ui/tooltip";
import { LuTrash2 } from "react-icons/lu";
import type { DragEvent } from "react";
import type { PageDraft } from "../types";

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
}) {
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
            value={page.title}
            onChange={(event) => onRename(page.id, event.target.value)}
          />
        </InputGroup>
      </Box>
      <Box
        h={"300px"}
        bg={"app.epub.bg.preview"}
        cursor={"grab"}
        draggable
        onDragStart={() => onDragStart(page.id)}
        onDragEnd={onDragEnd}
      >
        <iframe
          title={`preview-${page.id}`}
          srcDoc={page.previewHtml}
          sandbox=""
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            pointerEvents: "none",
          }}
        />
      </Box>
    </Box>
  );
}
