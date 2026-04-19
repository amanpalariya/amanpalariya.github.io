import {
  Box,
  Button,
  FileUpload,
  HStack,
  Icon,
  IconButton,
  Textarea,
} from "@chakra-ui/react";
import {
  type ChangeEvent,
  ClipboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  LuBookDown,
  LuCheck,
  LuChevronDown,
  LuFilePlus,
  LuChevronUp,
  LuLoaderCircle,
  LuRedo2,
  LuUndo2,
  LuUpload,
  LuX,
} from "react-icons/lu";
import { Tooltip } from "@components/ui/tooltip";

export function EpubToolbar({
  isAdding,
  isGenerating,
  isCancellingGeneration,
  generationProgress,
  showDownloadCompleteIcon,
  pageCount,
  pastedInput,
  onAddFromClipboard,
  onAddFromFiles,
  onGenerate,
  onCancelGeneration,
  onUndoPages,
  onRedoPages,
  canUndo,
  canRedo,
  onPastedInputChange,
  onPaste,
  onAddFromFallback,
}: {
  isAdding: boolean;
  isGenerating: boolean;
  isCancellingGeneration: boolean;
  generationProgress: number | null;
  showDownloadCompleteIcon: boolean;
  pageCount: number;
  pastedInput: string;
  onAddFromClipboard: () => Promise<void>;
  onAddFromFiles: (files: FileList | File[]) => Promise<void>;
  onGenerate: () => Promise<void>;
  onCancelGeneration: () => void;
  onUndoPages: () => void;
  onRedoPages: () => void;
  canUndo: boolean;
  canRedo: boolean;
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
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const saveProgressPercent = Math.max(
    0,
    Math.min(100, Math.round(generationProgress ?? 0)),
  );

  function handleUploadInputChange(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    void onAddFromFiles(files);
    event.target.value = "";
  }

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
            disabled={isGenerating}
            roundedRight={0}
            borderRightWidth={"0"}
            bg={"app.epub.button.primary.bg"}
            color={"app.epub.button.primary.fg"}
            _hover={{ bg: "app.epub.button.primary.hoverBg" }}
          >
            <Icon>
              <LuFilePlus />
            </Icon>
            Add from clipboard
          </Button>

          <FileUpload.Root maxFiles={50}>
            <FileUpload.HiddenInput
              ref={uploadInputRef}
              aria-label={"Upload files"}
              onChange={handleUploadInputChange}
            />
            <Tooltip content={"Upload files"}>
              <IconButton
                {...actionButtonProps}
                aria-label={"Upload files"}
                rounded={0}
                borderLeftWidth={"1px"}
                borderLeftColor={"app.epub.button.primary.divider"}
                bg={"app.epub.button.primary.bg"}
                color={"app.epub.button.primary.fg"}
                _hover={{ bg: "app.epub.button.primary.hoverBg" }}
                disabled={isGenerating}
                onClick={() => uploadInputRef.current?.click()}
              >
                <LuUpload />
              </IconButton>
            </Tooltip>
          </FileUpload.Root>

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
            disabled={isGenerating}
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
              disabled={isGenerating}
              minH={"140px"}
              m={0}
              display={"block"}
              rounded={"none"}
              borderWidth={0}
              bg={"app.epub.bg.card"}
              color={"app.epub.fg.default"}
              _placeholder={{ color: "app.epub.fg.subtle" }}
              placeholder={
                "Paste HTML, text, or an image here (Cmd/Ctrl+V). Content will be added on paste."
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
              disabled={isGenerating}
            >
              Add pasted content
            </Button>
          </Box>
        ) : null}
      </Box>

      <Button
        {...actionButtonProps}
        onClick={isGenerating ? onCancelGeneration : onGenerate}
        loading={false}
        disabled={!isGenerating && pageCount === 0}
        position={"relative"}
        overflow={"hidden"}
        _before={{
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: isGenerating ? `${saveProgressPercent}%` : "0%",
          bg: "rgba(255, 255, 255, 0.26)",
          opacity: isGenerating ? 1 : 0,
          transition: "width 0.2s linear",
        }}
        bg={isGenerating ? "red.500" : "app.epub.button.success.bg"}
        color={isGenerating ? "white" : "app.epub.button.success.fg"}
        _hover={{
          bg: isGenerating ? "red.600" : "app.epub.button.success.hoverBg",
        }}
      >
        <Box position={"relative"} zIndex={1}>
          <HStack
            gap={1.5}
            visibility={
              showDownloadCompleteIcon && !isGenerating
                ? "hidden"
                : "visible"
            }
          >
            <Icon
              animation={
                isGenerating && isCancellingGeneration
                  ? "spin 1s linear infinite"
                  : undefined
              }
            >
              {isGenerating ? (
                isCancellingGeneration ? (
                  <LuLoaderCircle />
                ) : (
                  <LuX />
                )
              ) : (
                <LuBookDown />
              )}
            </Icon>
            <Box as={"span"}>
              {isGenerating
                ? `${isCancellingGeneration ? "Cancelling" : "Cancel"} (${saveProgressPercent}%)`
                : "Save EPUB"}
            </Box>
          </HStack>
          {showDownloadCompleteIcon && !isGenerating ? (
            <Box
              position={"absolute"}
              inset={0}
              display={"flex"}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Icon>
                <LuCheck />
              </Icon>
            </Box>
          ) : null}
        </Box>
      </Button>

      <HStack gap={0} align={"stretch"}>
        <Button
          {...actionButtonProps}
          aria-label={"Undo page change"}
          onClick={onUndoPages}
          disabled={!canUndo || isGenerating}
          roundedRight={0}
          borderRightWidth={"0"}
          bg={"app.epub.button.subtle.bg"}
          color={"app.epub.button.subtle.fg"}
          _hover={{ bg: "app.epub.button.subtle.hoverBg" }}
        >
          <Icon>
            <LuUndo2 />
          </Icon>
          Undo
        </Button>

        <Tooltip content={"Redo"}>
          <IconButton
            {...actionButtonProps}
            aria-label={"Redo page change"}
            onClick={onRedoPages}
            disabled={!canRedo || isGenerating}
            roundedLeft={0}
            borderLeftWidth={"1px"}
            borderLeftColor={"app.epub.border.default"}
            bg={"app.epub.button.subtle.bg"}
            color={"app.epub.button.subtle.fg"}
            _hover={{ bg: "app.epub.button.subtle.hoverBg" }}
          >
            <LuRedo2 />
          </IconButton>
        </Tooltip>
      </HStack>
    </HStack>
  );
}
