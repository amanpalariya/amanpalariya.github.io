import { Wrap, WrapItem } from "@chakra-ui/react";
import { CategoryBadge } from "@components/core/Badges";
import type { CvSectionBase } from "data/cv";
import type { ElementType } from "react";
import type { AppAccentPalette, AppPalette } from "theme/colors/types";
import CvSection from "./CvSection";

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
  primaryColorPalette?: AppPalette;
  accentColorPalette?: AppAccentPalette;
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
