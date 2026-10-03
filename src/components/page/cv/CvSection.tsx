import { CV_DIVIDER_BORDER } from "./cvStyleTokens";
import { Box, VStack, Text } from "@chakra-ui/react";

import { HEADER_OFFSET_HEIGHT } from "@components/page/common/Header";
import type { ReactNode } from "react";
import type { ElementType } from "react";
import type { AppAccentPalette, AppPalette } from "theme/colors/types";
import { CV_BODY_FONT_FAMILY, CV_META_TEXT_SIZE } from "./cvStyleTokens";

export default function CvSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  titleIcon?: ElementType;
  primaryColorPalette?: AppPalette;
  accentColorPalette?: AppAccentPalette;
  children: ReactNode;
}) {
  return (
    <Box
      as="section"
      id={id}
      aria-labelledby={`${id}-heading`}
      scrollMarginTop={HEADER_OFFSET_HEIGHT}
      borderTop={CV_DIVIDER_BORDER}
      px={4}
      py={5}
    >
      <Text
        as="h2"
        id={`${id}-heading`}
        fontFamily={CV_BODY_FONT_FAMILY}
        fontSize="20px"
        fontWeight={750}
        lineHeight="1.3"
        letterSpacing="-0.3px"
        color="app.prose.heading"
        mb={4}
      >
        {title}
      </Text>
      <VStack align="stretch" gap={3}>
        {description ? (
          <Text
            fontSize={CV_META_TEXT_SIZE}
            color="app.prose.body"
            fontFamily={CV_BODY_FONT_FAMILY}
          >
            {description}
          </Text>
        ) : null}
        {children}
      </VStack>
    </Box>
  );
}
