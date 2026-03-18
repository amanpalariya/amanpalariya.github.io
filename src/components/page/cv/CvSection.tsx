import { Box, VStack, Text } from "@chakra-ui/react";
import HighlightedSection from "@components/page/common/HighlightedSection";
import { HEADER_OFFSET_HEIGHT } from "@components/page/common/Header";
import type { ReactNode } from "react";
import type { ElementType } from "react";
import type { AppAccentPalette, AppPalette } from "theme/colors/types";

export default function CvSection({
  id,
  title,
  description,
  titleIcon,
  primaryColorPalette,
  accentColorPalette,
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
    <Box id={id} scrollMarginTop={HEADER_OFFSET_HEIGHT}>
      <HighlightedSection
        title={title}
        titleIcon={titleIcon}
        primaryColorPalette={primaryColorPalette}
        accentColorPalette={accentColorPalette}
        separateHeader
      >
        <VStack align={"stretch"} gap={4} pb={2}>
          {description ? (
            <Text fontSize="sm" color={"app.fg.subtle"}>
              {description}
            </Text>
          ) : null}
          {children}
        </VStack>
      </HighlightedSection>
    </Box>
  );
}
