import {
  Badge,
  Box,
  Button,
  HStack,
  Icon,
  IconButton,
  Image,
  Popover,
  Separator,
  Stack,
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
  Fragment,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  LuChevronDown,
  LuChevronUp,
  LuExternalLink,
  LuFilePlus,
  LuRefreshCw,
  LuUpload,
} from "react-icons/lu";
import type { ManualImageEmbeddingItem } from "../types";

function ImagePreview({ item }: { item: ManualImageEmbeddingItem }) {
  const [replacementUrl, setReplacementUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    if (!item.replacement) {
      setReplacementUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(item.replacement.blob);
    setReplacementUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [item.replacement]);

  const previewUrl = replacementUrl ?? item.source;

  return (
    <Box
      w={{ base: "full", md: "112px" }}
      h={{ base: "160px", md: "96px" }}
      flexShrink={0}
      rounded={"md"}
      borderWidth={"1px"}
      borderColor={"app.epub.border.default"}
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
      ) : (
        <Image
          src={previewUrl}
          alt={item.replacement ? "Replacement preview" : "External preview"}
          maxW={"full"}
          maxH={"full"}
          objectFit={"contain"}
          onError={() => setHasError(true)}
        />
      )}
    </Box>
  );
}

function FailedImageRow({
  item,
  disabled,
  onUpload,
  onPaste,
}: {
  item: ManualImageEmbeddingItem;
  disabled: boolean;
  onUpload: (source: string, files: FileList | File[]) => Promise<void>;
  onPaste: (source: string) => Promise<void>;
}) {
  const actionButtonProps = {
    fontFamily: "ui",
    fontSize: "sm",
    rounded: "xl",
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
    <Stack
      gap={3}
      px={1}
      py={3}
      direction={{ base: "column", md: "row" }}
      align={{ base: "stretch", md: "center" }}
    >
      <ImagePreview item={item} />

      <VStack align={"stretch"} gap={1} flex={1} minW={0}>
        <HStack gap={2} wrap={"wrap"}>
          {item.pageTitle ? (
            <Badge colorPalette={"blue"} variant={"subtle"}>
              {item.pageTitle}
            </Badge>
          ) : null}
          {item.replacement ? (
            <Badge colorPalette={"green"} variant={"subtle"}>
              {item.replacement.label}
            </Badge>
          ) : (
            <Badge colorPalette={"orange"} variant={"subtle"}>
              Needs image
            </Badge>
          )}
        </HStack>
        <HStack gap={1.5} align={"start"}>
          <Text
            fontFamily={"mono"}
            fontSize={"xs"}
            color={"app.epub.fg.muted"}
            lineClamp={2}
            overflowWrap={"anywhere"}
            flex={1}
            minW={0}
          >
            {item.source}
          </Text>
          <Tooltip content={"Open image in a new tab"}>
            <IconButton
              asChild
              aria-label={"Open image in a new tab"}
              size={"sm"}
              variant={"ghost"}
              disabled={disabled}
            >
              <a href={item.source} target={"_blank"} rel={"noreferrer"}>
                <LuExternalLink />
              </a>
            </IconButton>
          </Tooltip>
        </HStack>
      </VStack>

      <Popover.Root
        open={isManualPasteOpen}
        onOpenChange={(details) => setIsManualPasteOpen(details.open)}
        positioning={{ placement: "bottom-end", gutter: 6 }}
      >
        <Box w={{ base: "full", md: "auto" }} flexShrink={0}>
          <HStack gap={0} w={"full"} maxW={"full"} justify={"start"}>
            <Button
              {...actionButtonProps}
              size={"sm"}
              flex={{ base: "1 1 auto", md: "0 0 auto" }}
              minW={0}
              roundedRight={0}
              borderRightWidth={"0"}
              bg={"app.epub.button.primary.bg"}
              color={"app.epub.button.primary.fg"}
              _hover={{ bg: "app.epub.button.primary.hoverBg" }}
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
                borderLeftWidth={"1px"}
                borderLeftColor={"app.epub.button.primary.divider"}
                bg={"app.epub.button.primary.bg"}
                color={"app.epub.button.primary.fg"}
                _hover={{ bg: "app.epub.button.primary.hoverBg" }}
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
                roundedLeft={0}
                borderLeftWidth={"1px"}
                borderLeftColor={"app.epub.button.primary.divider"}
                bg={"app.epub.button.primary.bg"}
                color={"app.epub.button.primary.fg"}
                _hover={{ bg: "app.epub.button.primary.hoverBg" }}
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
            rounded={"xl"}
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
    </Stack>
  );
}

export function ManualImageEmbeddingDialog({
  open,
  items,
  isGenerating,
  onOpenChange,
  onUpload,
  onPaste,
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
        rounded={"xl"}
        maxW={{ base: "calc(100vw - 1rem)", md: "760px" }}
      >
        <DialogHeader>
          <DialogTitle fontFamily={"ui"}>Review external images</DialogTitle>
        </DialogHeader>
        <DialogCloseTrigger />

        <DialogBody>
          <VStack align={"stretch"} gap={4}>
            <Text fontSize={"sm"} color={"app.epub.fg.muted"}>
              These image sources could not be fetched during EPUB generation.
              Review the preview, then upload or paste the image you want
              embedded before downloading.
            </Text>

            <VStack
              align={"stretch"}
              gap={0}
              maxH={"52vh"}
              overflowY={"auto"}
            >
              {items.map((item, index) => (
                <Fragment key={item.source}>
                  <FailedImageRow
                    item={item}
                    disabled={isGenerating}
                    onUpload={onUpload}
                    onPaste={onPaste}
                  />
                  {index < items.length - 1 ? (
                    <Separator size={"md"} />
                  ) : null}
                </Fragment>
              ))}
            </VStack>
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
                variant={"subtle"}
                disabled={isGenerating || !canDownloadAnyway}
                onClick={onDownloadAnyway}
              >
                Download anyway
              </Button>
              <Button
                size={"sm"}
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
