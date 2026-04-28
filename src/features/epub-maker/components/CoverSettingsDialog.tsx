import {
  Dialog,
  IconButton,
  type DialogOpenChangeDetails,
} from "@chakra-ui/react";
import { DialogCloseTrigger, DialogContent } from "@components/ui/dialog";
import { Tooltip } from "@components/ui/tooltip";
import { LuSettings2 } from "react-icons/lu";
import type { ReactNode } from "react";

export function CoverSettingsDialog({
  open,
  onOpenChange,
  activeCoverMode,
  isInteractionDisabled,
  children,
}: {
  open: boolean;
  onOpenChange: (details: DialogOpenChangeDetails) => void;
  activeCoverMode: "auto" | "custom";
  isInteractionDisabled: boolean;
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
        boxShadow={"lg"}
        maxW={"1120px"}
      >
        <Dialog.Header display={"flex"} alignItems={"center"} justifyContent={"flex-start"}>
          <Dialog.Title fontFamily={"ui"}>Cover settings</Dialog.Title>
        </Dialog.Header>

        <Dialog.Body>
          {children}
        </Dialog.Body>

        <DialogCloseTrigger />
      </DialogContent>
    </Dialog.Root>
  );
}
