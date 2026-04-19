import {
  Box,
  Button,
  FileUpload,
  Group,
  HStack,
  Icon,
  Input,
  Text,
} from "@chakra-ui/react";
import { Switch } from "@components/ui/switch";
import { Tooltip } from "@components/ui/tooltip";
import { type ChangeEvent, useRef } from "react";
import { LuCircleHelp, LuRefreshCw, LuSettings2, LuUpload } from "react-icons/lu";
import type { EpubMakerState } from "../types";

export function EpubMetadataForm({
  prefs,
  autoEpubFileName,
  coverEnabled,
  coverMode,
  hasCustomCover,
  onTitleChange,
  onAuthorChange,
  onManualFileNameChange,
  onToggleFileNameMode,
  onEmbedRemoteImagesChange,
  onAllowExternalLinksChange,
  onCoverEnabledChange,
  onReplaceCoverFromFiles,
  onResetCoverToAuto,
}: {
  prefs: EpubMakerState["prefs"];
  autoEpubFileName: string;
  coverEnabled: boolean;
  coverMode: EpubMakerState["coverMode"];
  hasCustomCover: boolean;
  onTitleChange: (value: string) => void;
  onAuthorChange: (value: string) => void;
  onManualFileNameChange: (value: string) => void;
  onToggleFileNameMode: () => void;
  onEmbedRemoteImagesChange: (value: boolean) => void;
  onAllowExternalLinksChange: (value: boolean) => void;
  onCoverEnabledChange: (value: boolean) => void;
  onReplaceCoverFromFiles: (files: FileList | File[]) => Promise<void>;
  onResetCoverToAuto: () => void;
}) {
  const controlInputProps = {
    fontFamily: "ui",
    fontSize: "sm",
    rounded: "xl",
  } as const;

  const actionButtonProps = {
    fontFamily: "ui",
    fontSize: "sm",
    rounded: "xl",
  } as const;

  const switchProps = {
    controlProps: {
      bg: "app.epub.switch.track.off",
      _checked: { bg: "app.epub.switch.track.on" },
    },
    thumbProps: {
      bg: "app.epub.switch.thumb",
    },
    labelProps: {
      color: "app.epub.switch.label",
    },
  } as const;

  const coverUploadInputRef = useRef<HTMLInputElement | null>(null);

  function handleCoverUploadChange(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    void onReplaceCoverFromFiles(files);
    event.target.value = "";
  }

  return (
    <>
      <HStack gap={3} wrap={"wrap"} align={"stretch"}>
        <Box minW={["full", "320px"]} flex={1}>
          <Text fontSize={"sm"} color={"app.epub.fg.muted"} mb={1}>
            Title (optional)
          </Text>
          <Input
            {...controlInputProps}
            placeholder={"EPUB Maker Pages"}
            bg={"app.epub.bg.card"}
            color={"app.epub.fg.default"}
            borderColor={"app.epub.border.default"}
            _placeholder={{ color: "app.epub.fg.subtle" }}
            value={prefs.title}
            onChange={(event) => onTitleChange(event.target.value)}
          />
        </Box>
        <Box minW={["full", "260px"]} flex={1}>
          <Text fontSize={"sm"} color={"app.epub.fg.muted"} mb={1}>
            Author (optional)
          </Text>
          <Input
            {...controlInputProps}
            placeholder={"Your name"}
            bg={"app.epub.bg.card"}
            color={"app.epub.fg.default"}
            borderColor={"app.epub.border.default"}
            _placeholder={{ color: "app.epub.fg.subtle" }}
            value={prefs.author}
            onChange={(event) => onAuthorChange(event.target.value)}
          />
        </Box>
        <Box minW={["full", "320px"]} flex={1}>
          <Text fontSize={"sm"} color={"app.epub.fg.muted"} mb={1}>
            File name
          </Text>
          <Group attached w={"full"}>
            <Input
              {...controlInputProps}
              flex={1}
              roundedRight={0}
              size={"md"}
              placeholder={"my-book.epub"}
              bg={"app.epub.bg.card"}
              color={"app.epub.fg.default"}
              borderColor={"app.epub.border.default"}
              _placeholder={{ color: "app.epub.fg.subtle" }}
              value={
                prefs.fileNameMode === "auto"
                  ? autoEpubFileName
                  : prefs.manualFileName
              }
              onChange={(event) => onManualFileNameChange(event.target.value)}
            />
            <Button
              {...actionButtonProps}
              size={"md"}
              roundedLeft={0}
              variant={"outline"}
              borderColor={"app.epub.border.default"}
              color={"app.epub.fg.default"}
              bg={"app.epub.bg.card"}
              _hover={{
                bg: "app.epub.bg.surface",
                color: "app.epub.fg.default",
              }}
              onClick={onToggleFileNameMode}
            >
              {prefs.fileNameMode === "auto" ? "Auto" : "Manual"}
            </Button>
          </Group>
        </Box>
      </HStack>

      <HStack gap={6} wrap={"wrap"} align={"center"}>
        <HStack gap={2}>
          <Icon color={"app.epub.fg.muted"}>
            <LuSettings2 />
          </Icon>
          <Text fontSize={"sm"} color={"app.epub.fg.muted"}>
            Generation options
          </Text>
        </HStack>
        <HStack gap={2}>
          <Switch
            {...switchProps}
            checked={prefs.sanitizeOptions.embedRemoteImages}
            onCheckedChange={(details) =>
              onEmbedRemoteImagesChange(details.checked)
            }
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
              role={"img"}
              aria-label={"About embed remote images"}
              color={"app.epub.fg.muted"}
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
            {...switchProps}
            checked={prefs.sanitizeOptions.allowExternalLinks}
            onCheckedChange={(details) =>
              onAllowExternalLinksChange(details.checked)
            }
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
              role={"img"}
              aria-label={"About keep external links"}
              color={"app.epub.fg.muted"}
              cursor={"help"}
              display={"inline-flex"}
              alignItems={"center"}
            >
              <LuCircleHelp />
            </Box>
          </Tooltip>
        </HStack>

        <HStack gap={2} align={"center"}>
          <Switch
            {...switchProps}
            checked={coverEnabled}
            onCheckedChange={(details) => onCoverEnabledChange(details.checked)}
          >
            Include cover
          </Switch>
          <Text fontSize={"xs"} color={"app.epub.fg.subtle"}>
            {coverMode === "custom" ? "Custom" : "Auto"}
          </Text>
        </HStack>

        <HStack gap={2} align={"center"}>
          <FileUpload.Root maxFiles={1}>
            <FileUpload.HiddenInput
              ref={coverUploadInputRef}
              aria-label={"Upload cover image"}
              accept={"image/*"}
              onChange={handleCoverUploadChange}
            />
            <Button
              {...actionButtonProps}
              size={"sm"}
              variant={"subtle"}
              bg={"app.epub.button.subtle.bg"}
              color={"app.epub.button.subtle.fg"}
              _hover={{ bg: "app.epub.button.subtle.hoverBg" }}
              onClick={() => coverUploadInputRef.current?.click()}
            >
              <Icon>
                <LuUpload />
              </Icon>
              Replace cover
            </Button>
          </FileUpload.Root>

          <Button
            {...actionButtonProps}
            size={"sm"}
            variant={"subtle"}
            disabled={!hasCustomCover}
            bg={"app.epub.button.subtle.bg"}
            color={"app.epub.button.subtle.fg"}
            _hover={{ bg: "app.epub.button.subtle.hoverBg" }}
            onClick={onResetCoverToAuto}
          >
            <Icon>
              <LuRefreshCw />
            </Icon>
            Reset cover
          </Button>
        </HStack>
      </HStack>
    </>
  );
}
