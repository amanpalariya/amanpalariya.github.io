import { VStack, Text } from "@chakra-ui/react";
import HighlightedSection from "@components/page/common/HighlightedSection";
import { useColorModeValue } from "@components/ui/color-mode";
import type { ReactNode } from "react";
import type { ElementType } from "react";

export default function CvSection({
  id,
  title,
  description,
  titleIcon,
  background,
  accentColor,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  titleIcon?: ElementType;
  background?: string;
  accentColor?: string;
  children: ReactNode;
}) {
  return (
    <div id={id}>
      <HighlightedSection
        title={title}
        titleIcon={titleIcon}
        background={background}
        accentColor={accentColor}
      >
        <VStack align={"stretch"} gap={4}>
          {description ? (
            <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
              {description}
            </Text>
          ) : null}
          {children}
        </VStack>
      </HighlightedSection>
    </div>
  );
}