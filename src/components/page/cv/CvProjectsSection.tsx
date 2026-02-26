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
import { ParagraphText, Heading4 } from "@components/core/Texts";
import { CategoryBadge } from "@components/core/Badges";
import type { CvSectionBase, CvProjectItem } from "data/cv";
import type { ElementType } from "react";
import { FiLink } from "react-icons/fi";
import CvSection from "./CvSection";

function ProjectCard({
  item,
  accentColorPalette,
}: {
  item: CvProjectItem;
  accentColorPalette?: "blue" | "purple" | "green" | "orange" | "yellow" | "red";
}) {
  const mutedColor = "app.fg.muted";

  return (
    <VStack align="stretch" gap={3}>
      <HStack justify="space-between" gap={2} flexWrap="wrap">
        <HStack gap={2} flexWrap="wrap">
          <Heading4>{item.name}</Heading4>
          {item.isFeatured ? (
            <CategoryBadge color={accentColorPalette ? "purple" : "blue"}>
              Featured
            </CategoryBadge>
          ) : null}
          {item.highlight ? (
            <CategoryBadge color={accentColorPalette ? "purple" : "blue"}>
              {item.highlight}
            </CategoryBadge>
          ) : null}
        </HStack>
        {item.url ? (
          <Link href={item.url} isExternal fontSize="sm" color={mutedColor}>
            <HStack gap={1}>
              <Icon as={FiLink} />
              <Text>View</Text>
            </HStack>
          </Link>
        ) : null}
      </HStack>
      <ParagraphText>{item.summary}</ParagraphText>
      {item.highlights && item.highlights.length > 0 ? (
        <VStack align="stretch" gap={1}>
          {item.highlights.map((highlight, index) => (
            <HStack key={index} align="start" gap={2}>
              <Text color={mutedColor}>•</Text>
              <Text fontSize="sm" color={mutedColor}>
                {highlight}
              </Text>
            </HStack>
          ))}
        </VStack>
      ) : null}
      {item.tags && item.tags.length > 0 ? (
        <Wrap spacing={2}>
          {item.tags.map((tag) => (
            <WrapItem key={tag}>
              <CategoryBadge color={accentColorPalette ? "purple" : "gray"}>
                {tag}
              </CategoryBadge>
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
  primaryColorPalette?: "blue" | "purple" | "green" | "orange" | "yellow" | "red";
  accentColorPalette?: "blue" | "purple" | "green" | "orange" | "yellow" | "red";
}) {
  if (!section || section.items.length === 0) return null;

  return (
    <CvSection
      id={section.id}
      title={section.title}
      description={section.description}
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