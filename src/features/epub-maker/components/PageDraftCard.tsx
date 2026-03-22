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
  return (
    <Box
      w={"full"}
      borderWidth={isDropTarget ? "2px" : "1px"}
      borderStyle={isDropTarget ? "dashed" : "solid"}
      borderColor={isDropTarget ? "colorPalette.solid" : "border.emphasized"}
      rounded={"md"}
      overflow={"hidden"}
      bg={"bg.panel"}
      opacity={isDragging ? 0.6 : 1}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <Box borderBottomWidth={"1px"} borderColor={"border.subtle"}>
        <InputGroup
          startAddon={chapterNumber}
          startAddonProps={{
            minW: "2.25rem",
            justifyContent: "center",
            fontSize: "xs",
            fontWeight: "semibold",
            color: "fg.muted",
            borderLeftWidth: 0,
            borderTopWidth: 0,
            borderBottomWidth: "1px",
            rounded: "none",
          }}
          endAddon={
            <Tooltip content={"Remove"}>
              <Button
                size={"sm"}
                variant={"ghost"}
                onClick={() => onRemove(page.id)}
                aria-label={"Remove page"}
                px={2}
                minW={"auto"}
                rounded={"none"}
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
            size={"sm"}
            rounded={"none"}
            borderLeftWidth={0}
            borderRightWidth={0}
            borderTopWidth={0}
            borderBottomWidth={"1px"}
            value={page.title}
            onChange={(event) => onRename(page.id, event.target.value)}
          />
        </InputGroup>
      </Box>
      <Box
        h={"300px"}
        bg={"bg"}
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
