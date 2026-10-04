import { Box, type BoxProps } from "@chakra-ui/react";
import type { ComponentProps, ReactNode } from "react";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "./dialog";

export function SiteDialogRoot(props: ComponentProps<typeof DialogRoot>) {
  return <DialogRoot placement="center" scrollBehavior="inside" {...props} />;
}

/** Sections own their padding so dividers can reach the dialog edges. */
export function SiteDialogContent({
  title,
  maxWidth = "560px",
  children,
}: {
  title: string;
  maxWidth?: string;
  children: ReactNode;
}) {
  return (
    <DialogContent
      bg="app.bg.canvas"
      color="app.fg.default"
      fontFamily="ui"
      borderWidth="1px"
      borderColor="app.border.default"
      rounded="xl"
      boxShadow="lg"
      w="full"
      maxW={`min(${maxWidth}, calc(100vw - 1rem))`}
      maxH="calc(100dvh - 2rem)"
      overflow="hidden"
    >
      <DialogHeader
        position="relative"
        px={{ base: 4, md: 6 }}
        py={4}
        pe={14}
        borderBottomWidth="1px"
        borderColor="app.border.default"
      >
        <DialogTitle fontSize="lg" fontWeight="bold">
          {title}
        </DialogTitle>
        <DialogCloseTrigger
          top="50%"
          transform="translateY(-50%)"
          rounded="full"
          color="app.fg.subtle"
          _hover={{ bg: "app.bg.overlay", color: "app.fg.default" }}
        />
      </DialogHeader>
      <DialogBody p={0}>{children}</DialogBody>
    </DialogContent>
  );
}

export function SiteDialogSection(props: BoxProps) {
  return (
    <Box
      px={{ base: 4, md: 6 }}
      py={4}
      borderTopWidth="1px"
      borderColor="app.border.default"
      _first={{ borderTopWidth: 0 }}
      {...props}
    />
  );
}
