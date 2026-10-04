import { IconButton } from "@chakra-ui/react";
import { DialogTrigger } from "@components/ui/dialog";
import { SiteDialogContent, SiteDialogRoot } from "@components/ui/site-dialog";
import { Tooltip } from "@components/ui/tooltip";
import { LuSettings2 } from "react-icons/lu";
import type { ReactNode } from "react";

type DialogOpenChangeDetails = {
  open: boolean;
};

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
    <SiteDialogRoot open={open} onOpenChange={onOpenChange}>
      <Tooltip content={"Cover settings"}>
        <DialogTrigger asChild>
          <IconButton
            size={"xs"}
            variant={"ghost"}
            rounded={"full"}
            color={"app.fg.subtle"}
            _hover={{ bg: "app.bg.overlay", color: "app.fg.default" }}
            aria-label={`Open cover settings (${activeCoverMode === "custom" ? "custom image" : "auto-generated"})`}
            disabled={isInteractionDisabled}
          >
            <LuSettings2 />
          </IconButton>
        </DialogTrigger>
      </Tooltip>

      <SiteDialogContent title="Cover settings" maxWidth="960px">
        {children}
      </SiteDialogContent>
    </SiteDialogRoot>
  );
}
