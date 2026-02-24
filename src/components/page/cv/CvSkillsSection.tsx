import { Box, HStack, VStack, Wrap, WrapItem } from "@chakra-ui/react";
import { CategoryBadge } from "@components/core/Badges";
import { ParagraphText } from "@components/core/Texts";
import type { CvSectionBase, CvSkillGroup } from "data/cv";
import { useColorModeValue } from "@components/ui/color-mode";
import CvSection from "./CvSection";

const LEVEL_SCALE: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

function SkillLevel({ level }: { level?: string }) {
  if (!level) return null;
  const label = level.charAt(0).toUpperCase() + level.slice(1);
  const activeCount = LEVEL_SCALE[level] ?? 0;
  const activeColor = useColorModeValue("gray.700", "gray.200");
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
}: {
  section: CvSectionBase & { items: CvSkillGroup[] };
}) {
  if (!section || section.items.length === 0) return null;

  return (
    <CvSection
      id={section.id}
      title={section.title}
      description={section.description}
    >
      <VStack align="stretch" gap={4}>
        {section.items.map((group) => (
          <VStack key={group.group} align="stretch" gap={2}>
            <ParagraphText>{group.group}</ParagraphText>
            <Wrap spacing={2}>
              {group.items.map((item) => (
                <WrapItem key={`${group.group}-${item.name}`}>
                  <HStack
                    spacing={2}
                    px={2}
                    py={1}
                    borderRadius="full"
                    borderWidth={1}
                    borderColor={useColorModeValue("gray.200", "gray.700")}
                  >
                    <CategoryBadge color="gray">{item.name}</CategoryBadge>
                    <SkillLevel level={item.level} />
                  </HStack>
                </WrapItem>
              ))}
            </Wrap>
          </VStack>
        ))}
      </VStack>
    </CvSection>
  );
}