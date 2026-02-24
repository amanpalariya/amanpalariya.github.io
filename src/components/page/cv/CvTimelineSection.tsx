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
import { ParagraphText, Heading4 } from "@components/core/Texts";
import { CategoryBadge } from "@components/core/Badges";
import type { CvSectionBase, CvTimelineItem } from "data/cv";
import { FiLink } from "react-icons/fi";
import { useColorModeValue } from "@components/ui/color-mode";
import CvSection from "./CvSection";
import type { ElementType } from "react";

type AccentPalette = "blue" | "purple" | "green" | "orange" | "yellow" | "red";

function TimelineItem({
  item,
  isLast,
  accentColor,
  tagColor,
}: {
  item: CvTimelineItem;
  isLast: boolean;
  accentColor?: string;
  tagColor: "gray" | AccentPalette;
}) {
  const mutedColor = useColorModeValue("gray.600", "gray.300");
  const dotColor = accentColor
    ? useColorModeValue(`${accentColor}.500`, `${accentColor}.300`)
    : useColorModeValue("gray.500", "gray.400");

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
              <Text>{`${item.start}${item.end ? ` - ${item.end}` : ""}`}</Text>
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
        {item.summary ? <ParagraphText>{item.summary}</ParagraphText> : null}
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
  background,
  accentColor,
}: {
  section: CvSectionBase & { items: CvTimelineItem[] };
  titleIcon?: ElementType;
  background?: string;
  accentColor?: AccentPalette;
}) {
  if (!section || section.items.length === 0) return null;
  const tagColor = accentColor ?? ("gray" as const);
  const railTint = accentColor
    ? useColorModeValue(`${accentColor}.200`, `${accentColor}.700`)
    : useColorModeValue("gray.200", "gray.700");
  const endCapColor = accentColor
    ? useColorModeValue(`${accentColor}.300`, `${accentColor}.500`)
    : useColorModeValue("gray.300", "gray.600");

  return (
    <CvSection
      id={section.id}
      title={section.title}
      description={section.description}
      titleIcon={titleIcon}
      background={background}
      accentColor={accentColor}
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
              isLast={index === section.items.length - 1}
              accentColor={accentColor}
              tagColor={tagColor}
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
