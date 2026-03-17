import { Box, HStack, VStack, Wrap, WrapItem, Text } from "@chakra-ui/react";
import { CategoryBadge } from "@components/core/Badges";
import { ParagraphText } from "@components/core/Texts";
import type { CvSectionBase, CvSkillGroup } from "data/cv";
import type { ElementType } from "react";
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
    ? `${accentColorPalette}.fg`
    : "app.fg.muted";
  const inactiveColor = "app.border.default";

  return (
    <HStack gap={1} aria-label={`${label} proficiency`} title={label}>
      {Array.from({ length: 4 }).map((_, index) => {
        const isActive = index < activeCount;
        return (
          <Box
            key={`${label}-${index}`}
            w={1.5}
            h={1.5}
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
      <VStack align="stretch" gap={5}>
        {section.items.map((group) => (
          <VStack key={group.group} align="stretch" gap={3}>
            <Text fontSize="sm" fontWeight="bold" color="app.fg.muted" letterSpacing="wider" textTransform="uppercase">
              {group.group}
            </Text>
            <Wrap gap={3}>
              {group.items.map((item) => (
                <WrapItem key={`${group.group}-${item.name}`}>
                  <Tooltip
                    content={
                      item.level ? `${item.name} · ${item.level}` : item.name
                    }
                    showArrow
                  >
                    <HStack
                      gap={3}
                      px={3}
                      py={1.5}
                      borderRadius="2xl"
                      borderWidth={1}
                      borderColor={"app.border.muted"}
                      bg={"app.bg.card"}
                      _hover={{
                        borderColor: "app.border.strong",
                        bg: "app.bg.surface",
                        transform: "translateY(-1px)",
                      }}
                      transition="all 0.2s ease"
                    >
                      <Text fontSize="sm" fontWeight="semibold" color="app.fg.default">
                        {item.name}
                      </Text>
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
