import {
  VStack,
  HStack,
  Text,
  Link,
  Wrap,
  WrapItem,
  Icon,
  Separator,
} from "@chakra-ui/react";
import { Heading4 } from "@components/core/Texts";
import { CategoryBadge, FeaturedIndicator } from "@components/core/Badges";
import type { CvSectionBase, CvProjectItem } from "data/cv";
import type { ElementType } from "react";
import { FiLink } from "react-icons/fi";
import CvSection from "./CvSection";
import { formatCvDateRange } from "./cvRenderUtils";
import type { AppAccentPalette, AppPalette } from "theme/colors/types";
import {
  CV_BULLET_ITEM_GAP,
  CV_BULLET_TEXT_COLOR,
  CV_CMU_BULLET_FONT_FAMILY,
  CV_CMU_FONT_FAMILY,
  CV_BULLET_LINE_HEIGHT,
  CV_BULLET_TEXT_SIZE,
  CV_META_TEXT_SIZE,
  CV_SECONDARY_TEXT_COLOR,
} from "./cvStyleTokens";

function ProjectCard({
  item,
  accentColorPalette,
}: {
  item: CvProjectItem;
  accentColorPalette?: AppAccentPalette;
}) {
  const badgeColor = accentColorPalette ?? "blue";
  const tagColor = accentColorPalette ?? "gray";
  const timeframe = formatCvDateRange({
    start: item.start,
    end: item.end,
  });
  const hasMetaLine = Boolean(timeframe);

  return (
    <VStack align="stretch" gap={2}>
      <HStack justify="space-between" gap={2} flexWrap="wrap">
        <VStack align="start" gap={0.5}>
          <HStack gap={2} flexWrap="wrap">
            <Heading4>{item.name}</Heading4>
            {item.isFeatured ? (
              <FeaturedIndicator colorPalette={badgeColor} />
            ) : null}
            {item.highlight ? (
              <CategoryBadge color={badgeColor}>{item.highlight}</CategoryBadge>
            ) : null}
          </HStack>
          {hasMetaLine ? (
            <Text
              fontSize={CV_META_TEXT_SIZE}
              color={CV_SECONDARY_TEXT_COLOR}
              fontFamily={CV_CMU_FONT_FAMILY}
            >
              {timeframe}
            </Text>
          ) : null}
        </VStack>
        {item.url ? (
          <Link
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            fontFamily={CV_CMU_FONT_FAMILY}
            fontSize={CV_META_TEXT_SIZE}
            color={CV_SECONDARY_TEXT_COLOR}
          >
            <HStack gap={1}>
              <Icon as={FiLink} />
              <Text>View</Text>
            </HStack>
          </Link>
        ) : null}
      </HStack>
      {item.highlights && item.highlights.length > 0 ? (
        <VStack align="stretch" gap={CV_BULLET_ITEM_GAP}>
          {item.highlights.map((highlight, index) => (
            <HStack key={index} align="start" gap={2}>
              <Text
                fontSize={CV_BULLET_TEXT_SIZE}
                color={CV_BULLET_TEXT_COLOR}
                lineHeight={CV_BULLET_LINE_HEIGHT}
              >
                •
              </Text>
              <Text
                fontSize={CV_BULLET_TEXT_SIZE}
                color={CV_BULLET_TEXT_COLOR}
                fontFamily={CV_CMU_BULLET_FONT_FAMILY}
                lineHeight={CV_BULLET_LINE_HEIGHT}
                textAlign="justify"
                hyphens="auto"
                flex={1}
                css={{ WebkitHyphens: "auto", textWrap: "pretty" }}
              >
                {highlight}
              </Text>
            </HStack>
          ))}
        </VStack>
      ) : null}
      {item.tags && item.tags.length > 0 ? (
        <Wrap gap={2}>
          {item.tags.map((tag) => (
            <WrapItem key={tag}>
              <CategoryBadge color={tagColor}>{tag}</CategoryBadge>
            </WrapItem>
          ))}
        </Wrap>
      ) : null}
    </VStack>
  );
}

export default function CvProjectsSection({
  section,
  titleIcon,
  primaryColorPalette,
  accentColorPalette,
}: {
  section: CvSectionBase & { items: CvProjectItem[] };
  titleIcon?: ElementType;
  primaryColorPalette?: AppPalette;
  accentColorPalette?: AppAccentPalette;
}) {
  if (!section || section.items.length === 0) return null;

  return (
    <CvSection
      id={section.id}
      title={section.title}
      titleIcon={titleIcon}
      primaryColorPalette={primaryColorPalette}
      accentColorPalette={accentColorPalette}
    >
      <VStack align="stretch" gap={4}>
        {section.items.map((item, index) => (
          <VStack key={`${item.name}-${index}`} align="stretch" gap={4}>
            <ProjectCard item={item} accentColorPalette={accentColorPalette} />
            {index < section.items.length - 1 ? <Separator /> : null}
          </VStack>
        ))}
      </VStack>
    </CvSection>
  );
}
