import { Box, Button, HStack, Icon, Input, InputGroup } from "@chakra-ui/react";
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
      w={"full"}
      borderWidth={"1px"}
      borderColor={"border.emphasized"}
      rounded={"md"}
      overflow={"hidden"}
      bg={"bg.panel"}
    >
      <Box borderBottomWidth={"1px"} borderColor={"border.subtle"}>
        <InputGroup
          startAddon={index + 1}
          startAddonProps={{
            minW: "2.25rem",
            justifyContent: "center",
            fontSize: "xs",
            fontWeight: "semibold",
            color: "fg.muted",
            borderLeftWidth: 0,
            borderRightWidth: "1px",
            borderTopWidth: 0,
            borderBottomWidth: "1px",
            rounded: "none",
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

        <Box px={1.5} py={1}>
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
