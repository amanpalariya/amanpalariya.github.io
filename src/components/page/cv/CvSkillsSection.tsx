import { Box, HStack, VStack, Wrap, WrapItem } from "@chakra-ui/react";
import { CategoryBadge } from "@components/core/Badges";
import { ParagraphText } from "@components/core/Texts";
import type { CvSectionBase, CvSkillGroup } from "data/cv";
import type { ElementType } from "react";
import { useColorModeValue } from "@components/ui/color-mode";
import { Tooltip } from "@components/ui/tooltip";
import CvSection from "./CvSection";

type AccentPalette = "blue" | "purple" | "green" | "orange" | "yellow" | "red";

const LEVEL_SCALE: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

function SkillLevel({
  level,
  accentColorPalette,
}: {
  level?: string;
  accentColorPalette?: AccentPalette;
}) {
  if (!level) return null;
  const label = level.charAt(0).toUpperCase() + level.slice(1);
  const activeCount = LEVEL_SCALE[level] ?? 0;
  const activeColor = accentColorPalette
    ? useColorModeValue(`${accentColorPalette}.500`, `${accentColorPalette}.300`)
    : useColorModeValue("gray.700", "gray.200");
  const inactiveColor = useColorModeValue("gray.300", "gray.600");

  return (
    <HStack spacing={1} aria-label={`${label} proficiency`} title={label}>
      {Array.from({ length: 4 }).map((_, index) => {
        const isActive = index < activeCount;
        return (
          <Box
            key={`${label}-${index}`}
            w={2}
            h={2}
            borderRadius="full"
            borderWidth="1px"
            borderColor={isActive ? activeColor : inactiveColor}
            bg={isActive ? activeColor : "transparent"}
          />
        );
      })}
    </HStack>
  );
}

export default function CvSkillsSection({
  section,
  titleIcon,
  primaryColorPalette,
  accentColorPalette,
}: {
  section: CvSectionBase & { items: CvSkillGroup[] };
  titleIcon?: ElementType;
  primaryColorPalette?: AccentPalette;
  accentColorPalette?: AccentPalette;
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
        {section.items.map((group) => (
          <VStack key={group.group} align="stretch" gap={2}>
            <ParagraphText>{group.group}</ParagraphText>
            <Wrap spacing={2}>
              {group.items.map((item) => (
                <WrapItem key={`${group.group}-${item.name}`}>
                  <Tooltip
                    content={item.level ? `${item.name} · ${item.level}` : item.name}
                    showArrow
                  >
                    <HStack
                      spacing={2}
                      px={2}
                      py={1}
                      borderRadius="full"
                      borderWidth={1}
                      borderColor={useColorModeValue("gray.200", "gray.700")}
                      _hover={{
                        borderColor: useColorModeValue("gray.400", "gray.500"),
                        bg: useColorModeValue("gray.50", "gray.800"),
                      }}
                      transition="background 0.2s ease, border-color 0.2s ease"
                    >
                      <CategoryBadge color={accentColorPalette ?? "gray"}>
                        {item.name}
                      </CategoryBadge>
                      <SkillLevel
                        level={item.level}
                        accentColorPalette={accentColorPalette}
                      />
                    </HStack>
                  </Tooltip>
                </WrapItem>
              ))}
            </Wrap>
          </VStack>
        ))}
      </VStack>
    </CvSection>
  );
}