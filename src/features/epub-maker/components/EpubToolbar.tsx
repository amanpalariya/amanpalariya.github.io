import { Button, HStack, Icon } from "@chakra-ui/react";
import { LuBookDown, LuEye, LuFilePlus } from "react-icons/lu";

export function EpubToolbar({
  isAdding,
  isGenerating,
  pageCount,
  showPasteFallback,
  onAddFromClipboard,
  onGenerate,
  onShowFallback,
}: {
  isAdding: boolean;
  isGenerating: boolean;
  pageCount: number;
  showPasteFallback: boolean;
  onAddFromClipboard: () => Promise<void>;
  onGenerate: () => Promise<void>;
  onShowFallback: () => void;
}) {
  return (
    <HStack gap={3} wrap={"wrap"}>
      <Button onClick={onAddFromClipboard} loading={isAdding}>
        <Icon>
          <LuFilePlus />
        </Icon>
        Add page from clipboard
      </Button>
      <Button onClick={onGenerate} loading={isGenerating} disabled={pageCount === 0}>
        <Icon>
          <LuBookDown />
        </Icon>
        Save EPUB
      </Button>
      {!showPasteFallback ? (
        <Button size={"sm"} variant={"outline"} onClick={onShowFallback}>
          <Icon>
            <LuEye />
          </Icon>
          Show fallback
        </Button>
      ) : null}
    </HStack>
  );
}
