import {
  Box,
  Button,
  Dialog,
  HStack,
  Icon,
  IconButton,
  Text,
  type DialogOpenChangeDetails,
} from "@chakra-ui/react";
import { DialogCloseTrigger, DialogContent } from "@components/ui/dialog";
import { Tooltip } from "@components/ui/tooltip";
import {
  LuEye,
  LuEyeOff,
  LuRedo2,
  LuRefreshCw,
  LuSettings2,
  LuUndo2,
} from "react-icons/lu";
import type { ReactNode } from "react";

const dialogOutlineButtonProps = {
  size: "md",
  variant: "outline",
  rounded: "lg",
  borderColor: "app.epub.border.default",
  color: "app.epub.fg.default",
  bg: "app.epub.bg.card",
  _hover: {
    bg: "app.epub.bg.surface",
    color: "app.epub.fg.default",
  },
} as const;

export function CoverSettingsDialog({
  open,
  onOpenChange,
  activeCoverMode,
  isInteractionDisabled,
  isEffectiveCoverEnabled,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onToggleCover,
  onReset,
  children,
}: {
  open: boolean;
  onOpenChange: (details: DialogOpenChangeDetails) => void;
  activeCoverMode: "auto" | "custom";
  isInteractionDisabled: boolean;
  isEffectiveCoverEnabled: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onToggleCover: () => void;
  onReset: () => void;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Tooltip content={"Cover settings"}>
        <Dialog.Trigger asChild>
          <IconButton
            size={"xs"}
            variant={"ghost"}
            aria-label={`Open cover settings (${activeCoverMode === "custom" ? "custom image" : "auto-generated"})`}
            disabled={isInteractionDisabled}
          >
            <LuSettings2 />
          </IconButton>
        </Dialog.Trigger>
      </Tooltip>

      <DialogContent
        bg={"app.epub.bg.surface"}
        color={"app.epub.fg.default"}
        rounded={"2xl"}
        borderWidth={"1px"}
        borderColor={"app.epub.border.default"}
        maxW={"1120px"}
      >
        <Dialog.Header display={"flex"} alignItems={"center"} justifyContent={"flex-start"}>
          <Dialog.Title fontFamily={"ui"}>Cover settings</Dialog.Title>
        </Dialog.Header>

        <Dialog.Body>
          <HStack gap={2} mb={4} wrap={"wrap"}>
            <HStack gap={0} align={"stretch"}>
              <Button
                {...dialogOutlineButtonProps}
                size={"sm"}
                roundedRight={0}
                borderRightWidth={"0"}
                onClick={onUndo}
                disabled={isInteractionDisabled || !canUndo}
              >
                <HStack gap={1.5}>
                  <Icon boxSize={4}>
                    <LuUndo2 />
                  </Icon>
                  <Text>Undo</Text>
                </HStack>
              </Button>
              <Tooltip content={"Redo"}>
                <IconButton
                  {...dialogOutlineButtonProps}
                  aria-label={"Redo cover settings change"}
                  size={"sm"}
                  roundedLeft={0}
                  borderLeftWidth={"1px"}
                  borderLeftColor={"app.epub.border.default"}
                  onClick={onRedo}
                  disabled={isInteractionDisabled || !canRedo}
                >
                  <LuRedo2 />
                </IconButton>
              </Tooltip>
            </HStack>

            <Button
              {...dialogOutlineButtonProps}
              size={"sm"}
              onClick={onToggleCover}
              disabled={isInteractionDisabled}
            >
              <HStack gap={1.5}>
                <Icon boxSize={4}>
                  {isEffectiveCoverEnabled ? <LuEyeOff /> : <LuEye />}
                </Icon>
                <Text>{isEffectiveCoverEnabled ? "Disable cover" : "Enable cover"}</Text>
              </HStack>
            </Button>

            <Button
              size={"sm"}
              variant={"ghost"}
              rounded={"lg"}
              bg={"transparent"}
              color={"app.epub.fg.danger"}
              _hover={{ bg: "app.status.danger.bg" }}
              onClick={onReset}
              disabled={isInteractionDisabled}
            >
              <HStack gap={1.5}>
                <Icon boxSize={4}>
                  <LuRefreshCw />
                </Icon>
                <Text>Reset</Text>
              </HStack>
            </Button>
          </HStack>

          {children}
        </Dialog.Body>

        <DialogCloseTrigger />
      </DialogContent>
    </Dialog.Root>
  );
}
