import { HStack, Text, VStack, Wrap, WrapItem } from "@chakra-ui/react";
import { CategoryBadge } from "@components/core/Badges";
import { ParagraphText } from "@components/core/Texts";
import type { CvSectionBase, CvSkillGroup } from "data/cv";
import { useColorModeValue } from "@components/ui/color-mode";
import CvSection from "./CvSection";

function SkillLevel({ level }: { level?: string }) {
  if (!level) return null;
  const label = level.charAt(0).toUpperCase() + level.slice(1);
  return (
    <Text fontSize="xs" color={useColorModeValue("gray.500", "gray.400")}>
      {label}
    </Text>
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