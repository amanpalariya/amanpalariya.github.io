import {
  Box,
  Button,
  HStack,
  Icon,
  IconButton,
  Textarea,
} from "@chakra-ui/react";
import { ClipboardEvent, useEffect, useRef, useState } from "react";
import {
  LuBookDown,
  LuChevronDown,
  LuFilePlus,
  LuChevronUp,
} from "react-icons/lu";

export function EpubToolbar({
  isAdding,
  isGenerating,
  pageCount,
  pastedInput,
  onAddFromClipboard,
  onGenerate,
  onPastedInputChange,
  onPaste,
  onAddFromFallback,
}: {
  isAdding: boolean;
  isGenerating: boolean;
  pageCount: number;
  pastedInput: string;
  onAddFromClipboard: () => Promise<void>;
  onGenerate: () => Promise<void>;
  onPastedInputChange: (value: string) => void;
  onPaste: (event: ClipboardEvent<HTMLTextAreaElement>) => void;
  onAddFromFallback: () => void;
}) {
  const actionButtonProps = {
    fontFamily: "ui",
    fontSize: "sm",
    rounded: "xl",
  } as const;

  const [isManualPasteOpen, setIsManualPasteOpen] = useState(false);
  const triggerGroupRef = useRef<HTMLDivElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isManualPasteOpen) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node | null;
      if (!target) return;

      if (popoverRef.current?.contains(target)) return;
      if (triggerGroupRef.current?.contains(target)) return;

      setIsManualPasteOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsManualPasteOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isManualPasteOpen]);

  return (
    <HStack gap={3} wrap={"wrap"} align={"start"}>
      <Box position={"relative"}>
        <HStack ref={triggerGroupRef} gap={0} align={"stretch"}>
          <Button
            {...actionButtonProps}
            onClick={onAddFromClipboard}
            loading={isAdding}
            roundedRight={0}
            borderRightWidth={"0"}
            bg={"app.epub.button.primary.bg"}
            color={"app.epub.button.primary.fg"}
            _hover={{ bg: "app.epub.button.primary.hoverBg" }}
          >
            <Icon>
              <LuFilePlus />
            </Icon>
            Add page from clipboard
          </Button>

          <IconButton
            {...actionButtonProps}
            aria-label={
              isManualPasteOpen ? "Hide manual paste" : "Show manual paste"
            }
            roundedLeft={0}
            borderLeftWidth={"1px"}
            borderLeftColor={"app.epub.button.primary.divider"}
            bg={"app.epub.button.primary.bg"}
            color={"app.epub.button.primary.fg"}
            _hover={{ bg: "app.epub.button.primary.hoverBg" }}
            onClick={() => setIsManualPasteOpen((prev) => !prev)}
          >
            {isManualPasteOpen ? <LuChevronUp /> : <LuChevronDown />}
          </IconButton>
        </HStack>

        {isManualPasteOpen ? (
          <Box
            ref={popoverRef}
            position={"absolute"}
            top={"calc(100% + 6px)"}
            left={0}
            zIndex={20}
            p={0}
            borderWidth={"1px"}
            borderColor={"app.epub.border.default"}
            rounded={"xl"}
            overflow={"hidden"}
            bg={"app.epub.bg.popover"}
            shadow={"lg"}
            w={{ base: "full", sm: "420px" }}
            minW={{ base: "280px", sm: "420px" }}
          >
            <Textarea
              value={pastedInput}
              onChange={(event) => onPastedInputChange(event.target.value)}
              onPaste={onPaste}
              minH={"140px"}
              m={0}
              display={"block"}
              rounded={"none"}
              borderWidth={0}
              bg={"app.epub.bg.card"}
              color={"app.epub.fg.default"}
              _placeholder={{ color: "app.epub.fg.subtle" }}
              placeholder={
                "Paste HTML or text here (Cmd/Ctrl+V). Content will be added on paste."
              }
            />
            <Button
              {...actionButtonProps}
              size={"sm"}
              variant={"subtle"}
              w={"full"}
              m={0}
              mt={"-1px"}
              display={"block"}
              rounded={"none"}
              bg={"app.epub.button.subtle.bg"}
              color={"app.epub.button.subtle.fg"}
              _hover={{ bg: "app.epub.button.subtle.hoverBg" }}
              onClick={onAddFromFallback}
            >
              Add pasted content as page
            </Button>
          </Box>
        ) : null}
      </Box>

      <Button
        {...actionButtonProps}
        onClick={onGenerate}
        loading={isGenerating}
        disabled={pageCount === 0}
        bg={"app.epub.button.success.bg"}
        color={"app.epub.button.success.fg"}
        _hover={{ bg: "app.epub.button.success.hoverBg" }}
      >
        <Icon>
          <LuBookDown />
        </Icon>
        Save EPUB
      </Button>
    </HStack>
  );
}
