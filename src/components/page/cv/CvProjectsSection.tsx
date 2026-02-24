import {
  VStack,
  HStack,
  Text,
  Link,
  Wrap,
  WrapItem,
  Icon,
  Box,
} from "@chakra-ui/react";
import { ParagraphText, Heading4 } from "@components/core/Texts";
import { CategoryBadge } from "@components/core/Badges";
import type { CvSectionBase, CvProjectItem } from "data/cv";
import { FiLink } from "react-icons/fi";
import { useColorModeValue } from "@components/ui/color-mode";
import CvSection from "./CvSection";

function ProjectCard({ item }: { item: CvProjectItem }) {
  const mutedColor = useColorModeValue("gray.600", "gray.300");

  return (
    <Box
      borderWidth={1}
      borderColor={useColorModeValue("gray.200", "gray.700")}
      borderRadius="2xl"
      p={[4, 5]}
    >
      <VStack align="stretch" gap={3}>
        <HStack justify="space-between" gap={2} flexWrap="wrap">
          <Heading4>{item.name}</Heading4>
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
                <CategoryBadge>{tag}</CategoryBadge>
              </WrapItem>
            ))}
          </Wrap>
        ) : null}
      </VStack>
    </Box>
  );
}

export default function CvProjectsSection({
  section,
}: {
  section: CvSectionBase & { items: CvProjectItem[] };
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
          <ProjectCard key={`${item.name}-${index}`} item={item} />
        ))}
      </VStack>
    </CvSection>
  );
}