import {
  IconButton,
  type DialogOpenChangeDetails,
} from "@chakra-ui/react";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
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
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <Tooltip content={"Cover settings"}>
        <DialogTrigger asChild>
          <IconButton
            size={"xs"}
            variant={"ghost"}
            aria-label={`Open cover settings (${activeCoverMode === "custom" ? "custom image" : "auto-generated"})`}
            disabled={isInteractionDisabled}
          >
            <LuSettings2 />
          </IconButton>
        </DialogTrigger>
      </Tooltip>

      <DialogContent
        bg={"app.epub.bg.surface"}
        color={"app.epub.fg.default"}
        rounded={"2xl"}
        boxShadow={"lg"}
        maxW={"1120px"}
      >
        <DialogHeader display={"flex"} alignItems={"center"} justifyContent={"flex-start"}>
          <DialogTitle fontFamily={"ui"}>Cover settings</DialogTitle>
        </DialogHeader>

        <DialogBody>
          {children}
        </DialogBody>

        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
}
