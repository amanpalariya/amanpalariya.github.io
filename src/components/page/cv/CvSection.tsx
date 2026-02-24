import { VStack, Text } from "@chakra-ui/react";
import HighlightedSection from "@components/page/common/HighlightedSection";
import { useColorModeValue } from "@components/ui/color-mode";
import type { ReactNode } from "react";

export default function CvSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div id={id}>
      <HighlightedSection title={title}>
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