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
  background,
  accentColor,
}: {
  section: CvSectionBase;
  items: string[];
  titleIcon?: ElementType;
  background?: string;
  accentColor?: BadgeColor;
}) {
  if (!section || items.length === 0) return null;

  return (
    <CvSection
      id={section.id}
      title={section.title}
      description={section.description}
      titleIcon={titleIcon}
      background={background}
      accentColor={accentColor}
    >
      <Wrap spacing={2}>
        {items.map((item) => (
          <WrapItem key={item}>
            <CategoryBadge color={accentColor ?? "gray"}>{item}</CategoryBadge>
          </WrapItem>
        ))}
      </Wrap>
    </CvSection>
  );
}
