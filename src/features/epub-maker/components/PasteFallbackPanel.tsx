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
        placeholder={
          "Click here and press Cmd/Ctrl+V to paste HTML or plain text (auto-add on paste when possible)."
        }
      />
      <HStack mt={2}>
        <Button
          {...actionButtonProps}
          size={"sm"}
          variant={"subtle"}
          onClick={onAdd}
        >
          <Icon>
            <LuClipboardPaste />
          </Icon>
          Add pasted content as page
        </Button>
        <Button
          {...actionButtonProps}
          size={"sm"}
          variant={"ghost"}
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
