import { VStack, Text } from "@chakra-ui/react";
import HighlightedSection from "@components/page/common/HighlightedSection";
import { useColorModeValue } from "@components/ui/color-mode";
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
    <div id={id}>
      <HighlightedSection
        title={title}
        titleIcon={titleIcon}
        primaryColorPalette={primaryColorPalette}
        accentColorPalette={accentColorPalette}
        separateHeader
      >
        <VStack align={"stretch"} gap={4} pb={2}>
          {description ? (
            <Text
              fontSize="sm"
              color={useColorModeValue("gray.600", "gray.400")}
            >
              {description}
            </Text>
          ) : null}
          {children}
        </VStack>
      </HighlightedSection>
    </div>
  );
}
