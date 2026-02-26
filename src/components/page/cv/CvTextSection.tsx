import { VStack } from "@chakra-ui/react";
import { ParagraphText } from "@components/core/Texts";
import type { CvSectionBase } from "data/cv";
import type { ElementType } from "react";
import CvSection from "./CvSection";

export default function CvTextSection({
  section,
  titleIcon,
  primaryColorPalette,
  accentColorPalette,
}: {
  section: CvSectionBase & { content: string };
  titleIcon?: ElementType;
  primaryColorPalette?: "blue" | "purple" | "green" | "orange" | "yellow" | "red";
  accentColorPalette?: "blue" | "purple" | "green" | "orange" | "yellow" | "red";
}) {
  if (!section || !section.content?.trim()) return null;

  return (
    <CvSection
      id={section.id}
      title={section.title}
      description={section.description}
      titleIcon={titleIcon}
      primaryColorPalette={primaryColorPalette}
      accentColorPalette={accentColorPalette}
    >
      <VStack align="stretch" gap={3} maxW="4xl">
        <ParagraphText>{section.content}</ParagraphText>
      </VStack>
    </CvSection>
  );
}
