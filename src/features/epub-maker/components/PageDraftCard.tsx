import { Box, Button, HStack, Icon, Input, Text } from "@chakra-ui/react";
import { Tooltip } from "@components/ui/tooltip";
import { LuArrowDown, LuArrowUp, LuTrash2 } from "react-icons/lu";
import type { PageDraft } from "../types";

export function PageDraftCard({
  page,
  index,
  total,
  onRemove,
  onRename,
  onMoveUp,
  onMoveDown,
}: {
  page: PageDraft;
  index: number;
  total: number;
  onRemove: (id: string) => void;
  onRename: (id: string, value: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}) {
  return (
    <Box
      w={"220px"}
      borderWidth={"1px"}
      borderColor={"border.emphasized"}
      rounded={"md"}
      overflow={"hidden"}
      bg={"bg.panel"}
    >
      <Box px={3} py={2} borderBottomWidth={"1px"} borderColor={"border.subtle"}>
        <Text fontSize={"xs"} color={"fg.muted"} mb={1}>
          Chapter {index + 1}
        </Text>
        <Input
          size={"sm"}
          value={page.title}
          onChange={(event) => onRename(page.id, event.target.value)}
          mb={2}
        />
        <HStack justify={"space-between"} align={"center"} gap={1}>
          <HStack gap={1}>
            <Tooltip content={"Move up"}>
              <Button
                size={"xs"}
                variant={"ghost"}
                onClick={() => onMoveUp(page.id)}
                disabled={index === 0}
                px={1.5}
                minW={"auto"}
              >
                <Icon>
                  <LuArrowUp />
                </Icon>
              </Button>
            </Tooltip>
            <Tooltip content={"Move down"}>
              <Button
                size={"xs"}
                variant={"ghost"}
                onClick={() => onMoveDown(page.id)}
                disabled={index === total - 1}
                px={1.5}
                minW={"auto"}
              >
                <Icon>
                  <LuArrowDown />
                </Icon>
              </Button>
            </Tooltip>
          </HStack>

          <Tooltip content={"Remove"}>
            <Button
              size={"xs"}
              variant={"ghost"}
              onClick={() => onRemove(page.id)}
              aria-label={"Remove page"}
              px={1.5}
              minW={"auto"}
            >
              <Icon>
                <LuTrash2 />
              </Icon>
            </Button>
          </Tooltip>
        </HStack>
      </Box>
      <Box h={"300px"} bg={"bg"}>
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
