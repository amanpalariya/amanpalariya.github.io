import {
  Clipboard as ChakraClipboard,
  type BoxProps,
  type ButtonProps,
} from "@chakra-ui/react";
import type React from "react";
import type { ReactNode } from "react";

type ClipboardTriggerProps = ButtonProps & {
  asChild?: boolean;
  children?: ReactNode;
};

type ClipboardIndicatorProps = BoxProps & {
  copied?: ReactNode;
  children?: ReactNode;
};

const ClipboardTrigger = ChakraClipboard.Trigger as React.ComponentType<ClipboardTriggerProps>;
const ClipboardIndicator =
  ChakraClipboard.Indicator as React.ComponentType<ClipboardIndicatorProps>;
const ClipboardCopyText =
  ChakraClipboard.CopyText as React.ComponentType<ClipboardIndicatorProps>;

export const Clipboard = {
  ...ChakraClipboard,
  Trigger: ClipboardTrigger,
  Indicator: ClipboardIndicator,
  CopyText: ClipboardCopyText,
};
