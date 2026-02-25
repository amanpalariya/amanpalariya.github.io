import {
  Box,
  HStack,
  Icon,
  Link,
  Separator,
  Text,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { CategoryBadge } from "@components/core/Badges";
import { ParagraphText, Heading4 } from "@components/core/Texts";
import type { CvSectionBase } from "data/cv";
import type { ElementType } from "react";
import { FiLink } from "react-icons/fi";
import { useColorModeValue } from "@components/ui/color-mode";
import CvSection from "./CvSection";

export interface CvAccomplishmentVisualItem {
  title: string;
  meta?: string;
  summary?: string;
  tags?: string[];
  url?: string;
}

export default function CvAccomplishmentsSection({
  section,
  items,
  titleIcon,
  background,
  accentColor,
}: {
  section: CvSectionBase;
  items: CvAccomplishmentVisualItem[];
  titleIcon?: ElementType;
  background?: string;
  accentColor?: "blue" | "purple" | "green" | "orange" | "yellow" | "red";
}) {
  if (!section || items.length === 0) return null;

  const mutedColor = useColorModeValue("gray.600", "gray.300");

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
        {items.map((item, index) => (
          <VStack key={`${item.title}-${index}`} align="stretch" gap={3}>
            <Box
              borderWidth={1}
              borderColor={useColorModeValue("gray.200", "gray.700")}
              borderRadius="lg"
              p={4}
              bg={useColorModeValue("white", "gray.900")}
            >
              <VStack align="stretch" gap={2}>
                <HStack justify="space-between" gap={2} flexWrap="wrap">
                  <VStack align="start" gap={1}>
                    <Heading4>{item.title}</Heading4>
                    {item.meta ? (
                      <Text fontSize="sm" color={mutedColor}>
                        {item.meta}
                      </Text>
                    ) : null}
                  </VStack>
                  {item.url ? (
                    <Link href={item.url} isExternal fontSize="sm" color={mutedColor}>
                      <HStack gap={1}>
                        <Icon as={FiLink} />
                        <Text>Open</Text>
                      </HStack>
                    </Link>
                  ) : null}
                </HStack>
                {item.summary ? <ParagraphText>{item.summary}</ParagraphText> : null}
                {item.tags && item.tags.length > 0 ? (
                  <Wrap spacing={2}>
                    {item.tags.map((tag) => (
                      <WrapItem key={`${item.title}-${tag}`}>
                        <CategoryBadge color={accentColor ?? "gray"}>{tag}</CategoryBadge>
                      </WrapItem>
                    ))}
                  </Wrap>
                ) : null}
              </VStack>
            </Box>
            {index < items.length - 1 ? <Separator /> : null}
          </VStack>
        ))}
      </VStack>
    </CvSection>
  );
}
