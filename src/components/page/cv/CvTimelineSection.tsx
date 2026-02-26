import {
  VStack,
  HStack,
  Link,
  Text,
  Wrap,
  WrapItem,
  Icon,
  Separator,
  Box,
} from "@chakra-ui/react";
import { Heading4 } from "@components/core/Texts";
import { CategoryBadge } from "@components/core/Badges";
import type { CvSectionBase, CvTimelineItem } from "data/cv";
import { FiLink } from "react-icons/fi";
import { useColorModeValue } from "@components/ui/color-mode";
import CvSection from "./CvSection";
import type { ElementType } from "react";
import { formatCvDateRange } from "./cvRenderUtils";

type AccentPalette = "blue" | "purple" | "green" | "orange" | "yellow" | "red";

function TimelineItem({
  item,
  accentColorPalette,
  tagColor,
  presentWhenEndMissing,
}: {
  item: CvTimelineItem;
  accentColorPalette?: string;
  tagColor: "gray" | AccentPalette;
  presentWhenEndMissing?: boolean;
}) {
  const mutedColor = useColorModeValue("gray.600", "gray.300");
  const highlights = item.highlights && item.highlights.length > 0
    ? item.highlights
    : item.summary
      ? [item.summary]
      : [];
  const dotColor = accentColorPalette
    ? useColorModeValue(`${accentColorPalette}.500`, `${accentColorPalette}.300`)
    : useColorModeValue("gray.500", "gray.400");
  const timeframe = formatCvDateRange({
    start: item.start,
    end: item.end,
    presentWhenEndMissing,
  });

  return (
    <HStack align="stretch" gap={4}>
      <VStack align="center" spacing={2} minW={4} pt={2}>
        <Box w={2.5} h={2.5} borderRadius="full" bg={dotColor} zIndex={1} />
      </VStack>
      <VStack align="stretch" gap={3} flex={1}>
        <HStack justify="space-between" flexWrap="wrap" gap={2}>
          <VStack align="start" gap={1}>
            <HStack gap={2} align="center" flexWrap="wrap">
              <Heading4>{item.title}</Heading4>
              <Text color={mutedColor} fontSize="sm">
                · {item.organization}
              </Text>
            </HStack>
            <HStack gap={2} color={mutedColor} fontSize="sm" wrap="wrap">
              {timeframe ? <Text>{timeframe}</Text> : null}
              {item.location ? <Text>{`· ${item.location}`}</Text> : null}
            </HStack>
          </VStack>
          {item.url ? (
            <Link href={item.url} isExternal fontSize="sm" color={mutedColor}>
              <HStack gap={1}>
                <Icon as={FiLink} />
                <Text>Visit</Text>
              </HStack>
            </Link>
          ) : null}
        </HStack>
        {highlights.length > 0 ? (
          <VStack align="stretch" gap={1}>
            {highlights.map((highlight, index) => (
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
                <CategoryBadge color={tagColor}>{tag}</CategoryBadge>
              </WrapItem>
            ))}
          </Wrap>
        ) : null}
      </VStack>
    </HStack>
  );
}

export default function CvTimelineSection({
  section,
  titleIcon,
  primaryColorPalette,
  accentColorPalette,
  presentWhenEndMissing,
}: {
  section: CvSectionBase & { items: CvTimelineItem[] };
  titleIcon?: ElementType;
  primaryColorPalette?: AccentPalette;
  accentColorPalette?: AccentPalette;
  presentWhenEndMissing?: boolean;
}) {
  if (!section || section.items.length === 0) return null;
  const resolvedAccentPalette = accentColorPalette ?? primaryColorPalette;
  const tagColor = resolvedAccentPalette ?? ("gray" as const);
  const railTint = resolvedAccentPalette
    ? useColorModeValue(`${resolvedAccentPalette}.200`, `${resolvedAccentPalette}.700`)
    : useColorModeValue("gray.200", "gray.700");
  const endCapColor = resolvedAccentPalette
    ? useColorModeValue(`${resolvedAccentPalette}.300`, `${resolvedAccentPalette}.500`)
    : useColorModeValue("gray.300", "gray.600");

  return (
    <CvSection
      id={section.id}
      title={section.title}
      description={section.description}
      titleIcon={titleIcon}
      primaryColorPalette={primaryColorPalette}
      accentColorPalette={resolvedAccentPalette}
    >
      <VStack align="stretch" gap={4} position="relative">
        <Box
          position="absolute"
          top="13px"
          bottom="9px"
          left="8px"
          w="2px"
          bg={railTint}
          zIndex={0}
          transform="translateX(-50%)"
        />
        <Box
          position="absolute"
          bottom="9px"
          left="8px"
          transform="translateX(-50%)"
          h="2px"
          w={3}
          bg={endCapColor}
          zIndex={0}
        />
        {section.items.map((item, index) => (
          <VStack key={`${item.title}-${index}`} align="stretch" gap={4}>
            <TimelineItem
              item={item}
              accentColorPalette={resolvedAccentPalette}
              tagColor={tagColor}
              presentWhenEndMissing={presentWhenEndMissing}
            />
            {index < section.items.length - 1 ? (
              <Box pl={8}>
                <Separator />
              </Box>
            ) : null}
          </VStack>
        ))}
      </VStack>
    </CvSection>
  );
}
