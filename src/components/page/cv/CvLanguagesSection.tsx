import { Box, HStack, Text, VStack, Separator } from "@chakra-ui/react";
import { Heading4 } from "@components/core/Texts";
import type { CvLanguageItem, CvSectionBase } from "data/cv";
import type { ElementType } from "react";
import { useColorModeValue } from "@components/ui/color-mode";
import CvSection from "./CvSection";

type AccentPalette = "blue" | "purple" | "green" | "orange" | "yellow" | "red";

function fluencyLabel(value?: CvLanguageItem["proficiency"]) {
  if (!value) return "Not specified";
  if (value === "native") return "Native";
  if (value === "professional") return "Professional";
  return "Basic";
}

function fluencyScore(value?: CvLanguageItem["proficiency"]) {
  if (value === "native") return 3;
  if (value === "professional") return 2;
  if (value === "basic") return 1;
  return 0;
}

export default function CvLanguagesSection({
  section,
  titleIcon,
  background,
  accentColor,
}: {
  section: CvSectionBase & { items: CvLanguageItem[] };
  titleIcon?: ElementType;
  background?: string;
  accentColor?: AccentPalette;
}) {
  if (!section || section.items.length === 0) return null;

  const cardBg = useColorModeValue("white", "gray.900");
  const mutedColor = useColorModeValue("gray.600", "gray.300");
  const fluencyColor = accentColor
    ? useColorModeValue(`${accentColor}.700`, `${accentColor}.200`)
    : mutedColor;
  const fluencyBg = accentColor
    ? useColorModeValue(`${accentColor}.100`, `${accentColor}.800`)
    : useColorModeValue("gray.100", "gray.800");
  const meterActive = accentColor
    ? useColorModeValue(`${accentColor}.500`, `${accentColor}.300`)
    : useColorModeValue("blue.500", "blue.300");
  const meterInactive = useColorModeValue("gray.200", "gray.700");

  return (
    <CvSection
      id={section.id}
      title={section.title}
      description={section.description}
      titleIcon={titleIcon}
      background={background}
      accentColor={accentColor}
    >
      <VStack align="stretch" gap={3}>
        {section.items.map((item, index) => (
          <VStack key={`${item.name}-${index}`} align="stretch" gap={2}>
            <HStack justify="space-between" align="start" gap={3}>
              <VStack align="start" gap={0}>
                <Heading4>{item.name}</Heading4>
                {item.nativeName ? (
                  <Text fontSize="sm" color={mutedColor}>
                    {item.nativeName}
                  </Text>
                ) : null}
              </VStack>
              <Text
                fontSize="xs"
                px={2}
                py={1}
                borderRadius="md"
                bg={fluencyBg}
                color={fluencyColor}
                whiteSpace="nowrap"
              >
                {fluencyLabel(item.proficiency)}
              </Text>
            </HStack>

            <VStack align="stretch" gap={1}>
              <HStack gap={2}>
                {[1, 2, 3].map((step) => (
                  <Box
                    key={step}
                    h="6px"
                    flex={1}
                    borderRadius="full"
                    bg={step <= fluencyScore(item.proficiency) ? meterActive : meterInactive}
                  />
                ))}
              </HStack>
            </VStack>

            {index < section.items.length - 1 ? <Separator /> : null}
          </VStack>
        ))}
      </VStack>
    </CvSection>
  );
}
