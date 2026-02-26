import { Box, HStack, Text, VStack, Separator } from "@chakra-ui/react";
import { Heading4 } from "@components/core/Texts";
import type { CvLanguageItem, CvSectionBase } from "data/cv";
import type { ElementType } from "react";
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
  primaryColorPalette,
  accentColorPalette,
}: {
  section: CvSectionBase & { items: CvLanguageItem[] };
  titleIcon?: ElementType;
  primaryColorPalette?: AccentPalette;
  accentColorPalette?: AccentPalette;
}) {
  if (!section || section.items.length === 0) return null;

  const cardBg = "app.bg.overlay";
  const mutedColor = "app.fg.subtle";
  const resolvedAccentPalette = accentColorPalette ?? primaryColorPalette;
  const fluencyColor = resolvedAccentPalette
    ? `${resolvedAccentPalette}.fg`
    : mutedColor;
  const fluencyBg = resolvedAccentPalette
    ? `${resolvedAccentPalette}.subtle`
    : "app.bg.surfaceMuted";
  const meterActive = resolvedAccentPalette
    ? `${resolvedAccentPalette}.emphasized`
    : "app.fg.muted";
  const meterInactive = "app.border.muted";

  return (
    <CvSection
      id={section.id}
      title={section.title}
      description={section.description}
      titleIcon={titleIcon}
      primaryColorPalette={primaryColorPalette}
      accentColorPalette={resolvedAccentPalette}
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
