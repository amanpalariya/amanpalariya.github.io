import {
  Box,
  Button,
  HStack,
  Icon,
  IconButton,
  Image,
  Popover,
  SimpleGrid,
  Splitter,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@components/ui/dialog";
import { Tooltip } from "@components/ui/tooltip";
import {
  type ChangeEvent,
  type ClipboardEvent as ReactClipboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  LuChevronDown,
  LuChevronUp,
  LuCircleAlert,
  LuCircleCheck,
  LuExternalLink,
  LuFilePlus,
  LuRefreshCw,
  LuRotateCcw,
  LuUpload,
} from "react-icons/lu";
import type { ManualImageEmbeddingItem } from "../types";

const SURFACE_RADIUS = "xl" as const;
const BUTTON_RADIUS = "xl" as const;

function PreviewImage({
  src,
  alt,
  onError,
}: {
  src: string;
  alt: string;
  onError?: () => void;
}) {
  return (
    <Box
      position={"relative"}
      w={"full"}
      h={"full"}
      display={"flex"}
      alignItems={"center"}
      justifyContent={"center"}
      bg={"app.epub.bg.preview"}
      overflow={"hidden"}
    >
      <Image
        src={src}
        alt={alt}
        maxW={"full"}
        maxH={"full"}
        objectFit={"contain"}
        onError={onError}
      />
    </Box>
  );
}

function ImagePreview({
  item,
  disabled,
  onReset,
}: {
  item: ManualImageEmbeddingItem;
  disabled: boolean;
  onReset: (source: string) => void;
}) {
  const [replacementUrl, setReplacementUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [sweepPercent, setSweepPercent] = useState(50);

  useEffect(() => {
    setHasError(false);
    setSweepPercent(50);
    if (!item.replacement) {
      setReplacementUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(item.replacement.blob);
    setReplacementUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [item.replacement]);

  const previewUrl = replacementUrl ?? item.source;
  const statusLabel = item.replacement
    ? item.replacement.label === "Clipboard image"
      ? "Using the image you pasted from the clipboard."
      : `Using ${item.replacement.label} as the replacement image.`
    : "This image still needs a replacement before it can be embedded.";
  const showComparison = Boolean(item.replacement && replacementUrl);
  const splitterLeftLabelOffset = `calc(${sweepPercent}% - 0.375rem)`;
  const splitterRightLabelOffset = `calc(${sweepPercent}% + 0.375rem)`;

  return (
    <Box
      position={"relative"}
      w={"full"}
      h={"156px"}
      flexShrink={0}
      bg={"app.epub.bg.preview"}
      overflow={"hidden"}
      display={"flex"}
      alignItems={"center"}
      justifyContent={"center"}
    >
      {hasError ? (
        <Text
          px={3}
          textAlign={"center"}
          fontSize={"xs"}
          color={"app.epub.fg.subtle"}
        >
          Preview unavailable
        </Text>
      ) : showComparison && replacementUrl ? (
        <Box position={"relative"} w={"full"} h={"full"}>
          <Box position={"absolute"} inset={0}>
            <PreviewImage
              src={item.source}
              alt={"Original external preview"}
              onError={() => setHasError(true)}
            />
          </Box>
          <Box
            position={"absolute"}
            inset={0}
            clipPath={`inset(0 0 0 ${sweepPercent}%)`}
            pointerEvents={"none"}
          >
            <PreviewImage
              src={replacementUrl}
              alt={"Replacement preview"}
            />
          </Box>
          <Box
            position={"absolute"}
            bottom={2}
            left={splitterLeftLabelOffset}
            transform={"translateX(-100%)"}
            textAlign={"center"}
            px={2}
            py={0.5}
            rounded={BUTTON_RADIUS}
            bg={"blackAlpha.700"}
            color={"white"}
            fontFamily={"ui"}
            fontSize={"2xs"}
            fontWeight={"semibold"}
            pointerEvents={"none"}
            zIndex={2}
          >
            Original
          </Box>
          <Box
            position={"absolute"}
            bottom={2}
            left={splitterRightLabelOffset}
            textAlign={"center"}
            px={2}
            py={0.5}
            rounded={BUTTON_RADIUS}
            bg={"blackAlpha.700"}
            color={"white"}
            fontFamily={"ui"}
            fontSize={"2xs"}
            fontWeight={"semibold"}
            pointerEvents={"none"}
            zIndex={2}
          >
            Added
          </Box>
          <Splitter.Root
            orientation={"horizontal"}
            defaultSize={[50, 50]}
            panels={[
              { id: "original", minSize: 5 },
              { id: "replacement", minSize: 5 },
            ]}
            onResize={(details) => setSweepPercent(details.size[0] ?? 50)}
            position={"absolute"}
            inset={0}
            zIndex={1}
            pointerEvents={"none"}
          >
            <Splitter.Panel id={"original"} />
            <Splitter.ResizeTrigger
              id={"original:replacement"}
              pointerEvents={"auto"}
            />
            <Splitter.Panel id={"replacement"} />
          </Splitter.Root>
        </Box>
      ) : (
        <PreviewImage
          src={previewUrl}
          alt={item.replacement ? "Replacement preview" : "External preview"}
          onError={() => setHasError(true)}
        />
      )}
      <Tooltip content={statusLabel}>
        <Box
          position={"absolute"}
          top={2}
          left={2}
          boxSize={7}
          rounded={"full"}
          bg={item.replacement ? "green.500" : "orange.500"}
          color={"white"}
          boxShadow={"sm"}
          display={"inline-flex"}
          alignItems={"center"}
          justifyContent={"center"}
          lineHeight={1}
          aria-label={statusLabel}
          tabIndex={0}
        >
          <Icon boxSize={4}>
            {item.replacement ? <LuCircleCheck /> : <LuCircleAlert />}
          </Icon>
        </Box>
      </Tooltip>
      <Box
        position={"absolute"}
        top={2}
        right={2}
        display={"flex"}
        rounded={BUTTON_RADIUS}
        overflow={"hidden"}
        bg={"blackAlpha.700"}
        boxShadow={"sm"}
      >
        <Tooltip content={"Open image in a new tab"}>
          <IconButton
            asChild
            aria-label={"Open image in a new tab"}
            size={"sm"}
            variant={"solid"}
            rounded={0}
            bg={"transparent"}
            color={"white"}
            _hover={{ bg: "blackAlpha.800" }}
            disabled={disabled}
          >
            <a href={item.source} target={"_blank"} rel={"noreferrer"}>
              <LuExternalLink />
            </a>
          </IconButton>
        </Tooltip>
        {item.replacement ? (
          <Tooltip content={"Reset replacement"}>
            <IconButton
              aria-label={"Reset replacement"}
              size={"sm"}
              variant={"solid"}
              rounded={0}
              bg={"transparent"}
              color={"white"}
              _hover={{ bg: "blackAlpha.800" }}
              disabled={disabled}
              borderLeftWidth={"1px"}
              borderLeftColor={"whiteAlpha.300"}
              onClick={() => onReset(item.source)}
            >
              <LuRotateCcw />
            </IconButton>
          </Tooltip>
        ) : null}
      </Box>
    </Box>
  );
}

function FailedImageCard({
  item,
  disabled,
  onUpload,
  onPaste,
  onReset,
}: {
  item: ManualImageEmbeddingItem;
  disabled: boolean;
  onUpload: (source: string, files: FileList | File[]) => Promise<void>;
  onPaste: (source: string) => Promise<void>;
  onReset: (source: string) => void;
}) {
  const actionButtonProps = {
    fontFamily: "ui",
    fontSize: "sm",
    rounded: BUTTON_RADIUS,
  } as const;

  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const [isManualPasteOpen, setIsManualPasteOpen] = useState(false);

  function handleUploadChange(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    void onUpload(item.source, files);
    event.target.value = "";
  }

  function handleManualPaste(
    event: ReactClipboardEvent<HTMLTextAreaElement>,
  ) {
    const imageFile = Array.from(event.clipboardData.items)
      .find((clipboardItem) => clipboardItem.type.startsWith("image/"))
      ?.getAsFile();
    if (!imageFile) return;

    event.preventDefault();
    void onUpload(item.source, [imageFile]);
    setIsManualPasteOpen(false);
  }

  return (
    <VStack
      align={"stretch"}
      gap={0}
      minW={0}
      borderWidth={"1px"}
      borderColor={"app.epub.border.default"}
      rounded={SURFACE_RADIUS}
      bg={"app.epub.bg.card"}
      overflow={"hidden"}
    >
      <ImagePreview item={item} disabled={disabled} onReset={onReset} />

      <Popover.Root
        open={isManualPasteOpen}
        onOpenChange={(details) => setIsManualPasteOpen(details.open)}
        positioning={{ placement: "bottom-end", gutter: 6 }}
      >
        <Box w={"full"} flexShrink={0}>
          <HStack gap={0} w={"full"} maxW={"full"} justify={"start"}>
            <Button
              {...actionButtonProps}
              size={"sm"}
              flex={"1 1 auto"}
              minW={0}
              roundedTopLeft={0}
              roundedTopRight={0}
              roundedRight={0}
              roundedBottomLeft={SURFACE_RADIUS}
              borderRightWidth={"0"}
              bg={"app.epub.button.subtle.bg"}
              color={"app.epub.button.subtle.fg"}
              _hover={{ bg: "app.epub.button.subtle.hoverBg" }}
              disabled={disabled}
              onClick={() => void onPaste(item.source)}
            >
              <Icon>
                <LuFilePlus />
              </Icon>
              Paste
            </Button>

            <input
              ref={uploadInputRef}
              aria-label={"Upload replacement image"}
              accept={"image/*"}
              hidden
              type={"file"}
              onChange={handleUploadChange}
            />
            <Tooltip content={"Upload replacement image"}>
              <IconButton
                {...actionButtonProps}
                aria-label={"Upload replacement image"}
                size={"sm"}
                flex={"0 0 auto"}
                rounded={0}
                roundedTopLeft={0}
                roundedTopRight={0}
                borderLeftWidth={"1px"}
                borderLeftColor={"app.epub.border.accent"}
                bg={"app.epub.button.subtle.bg"}
                color={"app.epub.button.subtle.fg"}
                _hover={{ bg: "app.epub.button.subtle.hoverBg" }}
                disabled={disabled}
                onClick={() => uploadInputRef.current?.click()}
              >
                <LuUpload />
              </IconButton>
            </Tooltip>

            <Popover.Trigger asChild>
              <IconButton
                {...actionButtonProps}
                aria-label={
                  isManualPasteOpen
                    ? "Hide manual image paste"
                    : "Show manual image paste"
                }
                size={"sm"}
                flex={"0 0 auto"}
                roundedTopLeft={0}
                roundedTopRight={0}
                roundedLeft={0}
                roundedBottomRight={SURFACE_RADIUS}
                borderLeftWidth={"1px"}
                borderLeftColor={"app.epub.border.accent"}
                bg={"app.epub.button.subtle.bg"}
                color={"app.epub.button.subtle.fg"}
                _hover={{ bg: "app.epub.button.subtle.hoverBg" }}
                disabled={disabled}
              >
                {isManualPasteOpen ? <LuChevronUp /> : <LuChevronDown />}
              </IconButton>
            </Popover.Trigger>
          </HStack>
        </Box>

        <Popover.Positioner zIndex={30}>
          <Popover.Content
            p={0}
            borderWidth={"1px"}
            borderColor={"app.epub.border.default"}
            rounded={SURFACE_RADIUS}
            overflow={"hidden"}
            bg={"app.epub.bg.popover"}
            shadow={"lg"}
            w={{ base: "calc(100vw - 2rem)", sm: "360px" }}
          >
            <Textarea
              onPaste={handleManualPaste}
              disabled={disabled}
              minH={"116px"}
              m={0}
              display={"block"}
              rounded={"none"}
              borderWidth={0}
              bg={"app.epub.bg.card"}
              color={"app.epub.fg.default"}
              _placeholder={{ color: "app.epub.fg.subtle" }}
              placeholder={
                "Paste a copied image here (Cmd/Ctrl+V). It will be used for this source."
              }
            />
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Root>
    </VStack>
  );
}

export function ManualImageEmbeddingDialog({
  open,
  items,
  isGenerating,
  onOpenChange,
  onUpload,
  onPaste,
  onReset,
  canDownloadAnyway,
  onDownloadAnyway,
  onRegenerate,
}: {
  open: boolean;
  items: ManualImageEmbeddingItem[];
  isGenerating: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (source: string, files: FileList | File[]) => Promise<void>;
  onPaste: (source: string) => Promise<void>;
  onReset: (source: string) => void;
  canDownloadAnyway: boolean;
  onDownloadAnyway: () => void;
  onRegenerate: () => Promise<void>;
}) {
  const replacementCount = items.filter(
    (item) => item.replacement,
  ).length;

  return (
    <DialogRoot
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      closeOnInteractOutside={false}
      placement={"center"}
      size={"lg"}
    >
      <DialogContent
        bg={"app.epub.bg.panel"}
        color={"app.epub.fg.default"}
        borderWidth={"1px"}
        borderColor={"app.epub.border.default"}
        rounded={SURFACE_RADIUS}
        maxW={{ base: "calc(100vw - 1rem)", md: "820px" }}
      >
        <DialogHeader>
          <DialogTitle fontFamily={"ui"}>Review external images</DialogTitle>
        </DialogHeader>
        <DialogCloseTrigger />

        <DialogBody>
          <VStack align={"stretch"} gap={3}>
            <Text fontSize={"sm"} color={"app.epub.fg.muted"}>
              Review each preview, then paste or upload replacements before
              downloading.
            </Text>

            <SimpleGrid
              columns={1}
              css={{
                "@media (min-width: 360px)": {
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                },
                "@media (min-width: 620px)": {
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                },
              }}
              gap={3}
              alignItems={"start"}
              maxH={"52vh"}
              overflowY={"auto"}
              pr={{ base: 0, md: 1 }}
            >
              {items.map((item) => (
                <FailedImageCard
                  key={item.source}
                  item={item}
                  disabled={isGenerating}
                  onUpload={onUpload}
                  onPaste={onPaste}
                  onReset={onReset}
                />
              ))}
            </SimpleGrid>
          </VStack>
        </DialogBody>

        <DialogFooter>
          <HStack gap={2} justify={"space-between"} w={"full"} wrap={"wrap"}>
            <Text fontSize={"xs"} color={"app.epub.fg.muted"}>
              {replacementCount} of {items.length} selected for embedding
            </Text>
            <HStack gap={2}>
              <Button
                size={"sm"}
                rounded={BUTTON_RADIUS}
                variant={"subtle"}
                disabled={isGenerating || !canDownloadAnyway}
                onClick={onDownloadAnyway}
              >
                Download anyway
              </Button>
              <Button
                size={"sm"}
                rounded={BUTTON_RADIUS}
                bg={"app.epub.button.success.bg"}
                color={"app.epub.button.success.fg"}
                _hover={{ bg: "app.epub.button.success.hoverBg" }}
                disabled={replacementCount === 0}
                loading={isGenerating}
                onClick={() => void onRegenerate()}
              >
                <Icon>
                  <LuRefreshCw />
                </Icon>
                Regenerate EPUB
              </Button>
            </HStack>
          </HStack>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
