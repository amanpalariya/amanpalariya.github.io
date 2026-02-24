import {
  VStack,
  HStack,
  Text,
  Link,
  Wrap,
  WrapItem,
  Icon,
  Separator,
  Box,
} from "@chakra-ui/react";
import { ParagraphText, Heading4 } from "@components/core/Texts";
import { CategoryBadge } from "@components/core/Badges";
import type { CvSectionBase, CvProjectItem } from "data/cv";
import type { ElementType } from "react";
import { FiLink } from "react-icons/fi";
import { useColorModeValue } from "@components/ui/color-mode";
import CvSection from "./CvSection";

function ProjectCard({
  item,
  accentColor,
}: {
  item: CvProjectItem;
  accentColor?: "blue" | "purple" | "green" | "orange" | "yellow" | "red";
}) {
  const mutedColor = useColorModeValue("gray.600", "gray.300");
  const fallbackAccent = useColorModeValue("blue.600", "blue.200");
  const resolvedAccent = accentColor ?? fallbackAccent;
  const hoverBg = useColorModeValue("gray.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box
      borderWidth={1}
      borderColor={borderColor}
      borderRadius="xl"
      p={4}
      _hover={{
        bg: hoverBg,
        transform: "scale(1.01)",
        borderColor: resolvedAccent,
      }}
      transition="background 0.2s ease, transform 0.2s ease, border-color 0.2s ease"
    >
      <VStack align="stretch" gap={3}>
        <HStack justify="space-between" gap={2} flexWrap="wrap">
          <HStack gap={2} flexWrap="wrap">
            <Heading4>{item.name}</Heading4>
            {item.highlight ? (
              <CategoryBadge color={accentColor ? "purple" : "blue"}>
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
                <CategoryBadge color={accentColor ? "purple" : "gray"}>
                  {tag}
                </CategoryBadge>
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
  titleIcon,
  background,
  accentColor,
}: {
  section: CvSectionBase & { items: CvProjectItem[] };
  titleIcon?: ElementType;
  background?: string;
  accentColor?: "blue" | "purple" | "green" | "orange" | "yellow" | "red";
}) {
  if (!section || section.items.length === 0) return null;

  return (
    <CvSection
      id={section.id}
      title={section.title}
      description={section.description}
      titleIcon={titleIcon}
      background={background}
      accentColor={accentColor}
    >
      <VStack align="stretch" gap={4}>
        {section.items.map((item, index) => (
          <VStack key={`${item.name}-${index}`} align="stretch" gap={4}>
            <ProjectCard item={item} accentColor={accentColor} />
            {index < section.items.length - 1 ? <Separator /> : null}
          </VStack>
        ))}
      </VStack>
    </CvSection>
  );
}