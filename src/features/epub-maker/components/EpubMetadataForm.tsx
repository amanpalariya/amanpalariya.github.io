import { Box, Button, Group, HStack, Icon, Input, Text } from "@chakra-ui/react";
import { Switch } from "@components/ui/switch";
import { Tooltip } from "@components/ui/tooltip";
import { LuCircleHelp, LuSettings2 } from "react-icons/lu";
import type { EpubMakerState } from "../types";

export function EpubMetadataForm({
  prefs,
  autoEpubFileName,
  onTitleChange,
  onAuthorChange,
  onManualFileNameChange,
  onToggleFileNameMode,
  onEmbedRemoteImagesChange,
  onAllowExternalLinksChange,
}: {
  prefs: EpubMakerState["prefs"];
  autoEpubFileName: string;
  onTitleChange: (value: string) => void;
  onAuthorChange: (value: string) => void;
  onManualFileNameChange: (value: string) => void;
  onToggleFileNameMode: () => void;
  onEmbedRemoteImagesChange: (value: boolean) => void;
  onAllowExternalLinksChange: (value: boolean) => void;
}) {
  return (
    <>
      <HStack gap={3} wrap={"wrap"} align={"stretch"}>
        <Box minW={["full", "320px"]} flex={1}>
          <Text fontSize={"sm"} color={"fg.muted"} mb={1}>
            Title (optional)
          </Text>
          <Input
            placeholder={"EPUB Maker Pages"}
            value={prefs.title}
            onChange={(event) => onTitleChange(event.target.value)}
          />
        </Box>
        <Box minW={["full", "260px"]} flex={1}>
          <Text fontSize={"sm"} color={"fg.muted"} mb={1}>
            Author (optional)
          </Text>
          <Input
            placeholder={"Your name"}
            value={prefs.author}
            onChange={(event) => onAuthorChange(event.target.value)}
          />
        </Box>
        <Box minW={["full", "320px"]} flex={1}>
          <Text fontSize={"sm"} color={"fg.muted"} mb={1}>
            File name
          </Text>
          <Group attached w={"full"}>
            <Input
              flex={1}
              size={"md"}
              placeholder={"my-book.epub"}
              value={
                prefs.fileNameMode === "auto" ? autoEpubFileName : prefs.manualFileName
              }
              onChange={(event) => onManualFileNameChange(event.target.value)}
            />
            <Button size={"md"} variant={"outline"} onClick={onToggleFileNameMode}>
              {prefs.fileNameMode === "auto" ? "Auto" : "Manual"}
            </Button>
          </Group>
        </Box>
      </HStack>

      <HStack gap={6} wrap={"wrap"} align={"center"}>
        <HStack gap={2}>
          <Icon>
            <LuSettings2 />
          </Icon>
          <Text fontSize={"sm"} color={"fg.muted"}>
            Generation options
          </Text>
        </HStack>
        <HStack gap={2}>
          <Switch
            checked={prefs.sanitizeOptions.embedRemoteImages}
            onCheckedChange={(details) => onEmbedRemoteImagesChange(details.checked)}
          >
            Embed remote images
          </Switch>
          <Tooltip
            content={
              "When enabled, remote images are downloaded and packaged into the EPUB. When disabled, image URLs stay external."
            }
          >
            <Box
              as={"span"}
              aria-label={"About embed remote images"}
              color={"fg.muted"}
              cursor={"help"}
              display={"inline-flex"}
              alignItems={"center"}
            >
              <LuCircleHelp />
            </Box>
          </Tooltip>
        </HStack>
        <HStack gap={2}>
          <Switch
            checked={prefs.sanitizeOptions.allowExternalLinks}
            onCheckedChange={(details) => onAllowExternalLinksChange(details.checked)}
          >
            Keep external links
          </Switch>
          <Tooltip
            content={
              "When enabled, clickable links are kept in chapter content. When disabled, link targets are removed from sanitized HTML."
            }
          >
            <Box
              as={"span"}
              aria-label={"About keep external links"}
              color={"fg.muted"}
              cursor={"help"}
              display={"inline-flex"}
              alignItems={"center"}
            >
              <LuCircleHelp />
            </Box>
          </Tooltip>
        </HStack>
      </HStack>
    </>
  );
}
