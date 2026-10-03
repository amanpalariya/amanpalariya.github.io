import { Box, VStack } from "@chakra-ui/react";
import { Heading1, SubtitleText } from "@components/core/Texts";
import type { ReactNode } from "react";

export default function PageIntro({
  title,
  subtitle,
  children,
}: {
  title: ReactNode;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <Box as="header" pb={6}>
      <VStack align="stretch" gap={2}>
        <Heading1>{title}</Heading1>
        {subtitle ? <SubtitleText>{subtitle}</SubtitleText> : null}
        {children}
      </VStack>
    </Box>
  );
}
