import {
  VStack,
  HStack,
  Link,
  Text,
  Wrap,
  WrapItem,
  Icon,
  Separator,
} from "@chakra-ui/react";
import { ParagraphText, Heading4 } from "@components/core/Texts";
import { CategoryBadge } from "@components/core/Badges";
import type { CvSectionBase, CvTimelineItem } from "data/cv";
import { FiLink } from "react-icons/fi";
import { useColorModeValue } from "@components/ui/color-mode";
import CvSection from "./CvSection";

function TimelineItem({ item }: { item: CvTimelineItem }) {
  const mutedColor = useColorModeValue("gray.600", "gray.300");

  return (
    <VStack align="stretch" gap={3}>
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
              <CategoryBadge>{tag}</CategoryBadge>
            </WrapItem>
          ))}
        </Wrap>
      ) : null}
    </VStack>
  );
}

export default function CvTimelineSection({
  section,
}: {
  section: CvSectionBase & { items: CvTimelineItem[] };
}) {
  if (!section || section.items.length === 0) return null;

  return (
    <CvSection
      id={section.id}
      title={section.title}
      description={section.description}
    >
      <VStack align="stretch" gap={4}>
        {section.items.map((item, index) => (
          <VStack key={`${item.title}-${index}`} align="stretch" gap={4}>
            <TimelineItem item={item} />
            {index < section.items.length - 1 ? <Separator /> : null}
          </VStack>
        ))}
      </VStack>
    </CvSection>
  );
}