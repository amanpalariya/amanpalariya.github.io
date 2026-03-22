import { Box, Button, HStack, Icon, Textarea } from "@chakra-ui/react";
import { ClipboardEvent } from "react";
import { LuClipboardPaste, LuEyeOff } from "react-icons/lu";

export function PasteFallbackPanel({
  pastedInput,
  onInputChange,
  onPaste,
  onAdd,
  onHide,
}: {
  pastedInput: string;
  onInputChange: (value: string) => void;
  onPaste: (event: ClipboardEvent<HTMLTextAreaElement>) => void;
  onAdd: () => void;
  onHide: () => void;
}) {
  const actionButtonProps = {
    fontFamily: "ui",
    fontSize: "sm",
    rounded: "xl",
  } as const;

  const controlInputProps = {
    fontFamily: "ui",
    fontSize: "sm",
    rounded: "xl",
  } as const;

  return (
    <Box>
      <Textarea
        {...controlInputProps}
        value={pastedInput}
        onChange={(event) => onInputChange(event.target.value)}
        onPaste={onPaste}
        minH={"140px"}
        bg={"app.epub.bg.card"}
        color={"app.epub.fg.default"}
        borderColor={"app.epub.border.default"}
        _placeholder={{ color: "app.epub.fg.subtle" }}
        placeholder={
          "Click here and press Cmd/Ctrl+V to paste HTML or plain text (auto-add on paste when possible)."
        }
      />
      <HStack mt={2}>
        <Button
          {...actionButtonProps}
          size={"sm"}
          variant={"subtle"}
          bg={"app.epub.button.subtle.bg"}
          color={"app.epub.button.subtle.fg"}
          _hover={{ bg: "app.epub.button.subtle.hoverBg" }}
          onClick={onAdd}
        >
          <Icon>
            <LuClipboardPaste />
          </Icon>
          Add pasted content
        </Button>
        <Button
          {...actionButtonProps}
          size={"sm"}
          variant={"ghost"}
          color={"app.epub.fg.muted"}
          _hover={{ bg: "app.epub.bg.surface", color: "app.epub.fg.default" }}
          onClick={onHide}
        >
          <Icon>
            <LuEyeOff />
          </Icon>
          Hide fallback
        </Button>
      </HStack>
    </Box>
  );
}
