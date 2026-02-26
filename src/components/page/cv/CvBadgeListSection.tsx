import { Wrap, WrapItem } from "@chakra-ui/react";
import { CategoryBadge } from "@components/core/Badges";
import type { CvSectionBase } from "data/cv";
import type { ElementType } from "react";
import CvSection from "./CvSection";

type BadgeColor = "blue" | "purple" | "green" | "orange" | "yellow" | "red";

export default function CvBadgeListSection({
  section,
  items,
  titleIcon,
  primaryColorPalette,
  accentColorPalette,
}: {
  section: CvSectionBase;
  items: string[];
  titleIcon?: ElementType;
  primaryColorPalette?: BadgeColor;
  accentColorPalette?: BadgeColor;
}) {
  if (!section || items.length === 0) return null;

  return (
    <CvSection
      id={section.id}
      title={section.title}
      description={section.description}
      titleIcon={titleIcon}
      primaryColorPalette={primaryColorPalette}
      accentColorPalette={accentColorPalette}
    >
      <Wrap spacing={2}>
        {items.map((item) => (
          <WrapItem key={item}>
            <CategoryBadge color={accentColorPalette ?? "gray"}>{item}</CategoryBadge>
          </WrapItem>
        ))}
      </Wrap>
    </CvSection>
  );
}
