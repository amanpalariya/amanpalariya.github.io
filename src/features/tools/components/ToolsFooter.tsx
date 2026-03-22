import { Box, HStack, Link, Text, VStack } from "@chakra-ui/react";

const footerLinkProps = {
  fontSize: "sm",
  color: "app.fg.subtle",
  lineHeight: "short",
  _hover: {
    color: "app.fg.default",
    textDecoration: "underline",
    textUnderlineOffset: "3px",
  },
} as const;

export function ToolsFooter() {
  return (
    <Box px={[2, 4]} pb={[2, 4]} pt={1}>
      <Box
        borderWidth={"2px"}
        borderColor={"app.border.default"}
        borderRadius={"2xl"}
        background={"app.bg.cardHeader"}
        px={[4, 5]}
        py={4}
      >
        <VStack align={"stretch"} gap={3}>
          <Text fontSize={"sm"} color={"app.fg.subtle"}>
            Tools are evolving. New utilities will appear here over time.
          </Text>

          <HStack gap={4} wrap={"wrap"}>
            <Link href="/tools/" {...footerLinkProps}>
              Directory
            </Link>
            <Link href="/tools/epub-maker/" {...footerLinkProps}>
              EPUB Maker
            </Link>
            <Link href="/" {...footerLinkProps}>
              Main site
            </Link>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}
