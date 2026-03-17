import { Box, Text, VStack, SimpleGrid, Badge, HStack } from "@chakra-ui/react";
import { Heading4 } from "@components/core/Texts";
import type { CvCourseItem, CvSectionBase } from "data/cv";
import type { ElementType } from "react";
import type { AppAccentPalette, AppPalette } from "theme/colors/types";
import CvSection from "./CvSection";
import { formatCvDate } from "./cvRenderUtils";

export default function CvCoursesSection({
  section,
  titleIcon,
  primaryColorPalette,
  accentColorPalette,
}: {
  section: CvSectionBase & { items: CvCourseItem[] };
  titleIcon?: ElementType;
  primaryColorPalette?: AppPalette;
  accentColorPalette?: AppAccentPalette;
}) {
  if (!section || section.items.length === 0) return null;

  const cardBg = "app.bg.overlay";
  const cardBorder = "app.border.muted";
  const mutedColor = "app.fg.subtle";

  return (
    <CvSection
      id={section.id}
      title={section.title}
      description={section.description}
      titleIcon={titleIcon}
      primaryColorPalette={primaryColorPalette}
      accentColorPalette={accentColorPalette}
    >
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={3}>
        {section.items.map((item, index) => {
          const timeframe = item.timeframe ?? (item.date ? formatCvDate(item.date) : undefined);

          return (
            <Box
              key={`${item.name}-${index}`}
              borderWidth={1}
              borderColor={cardBorder}
              borderRadius="lg"
              p={3}
              bg={cardBg}
              height="full"
              transition="border-color 0.2s ease"
              _hover={{ borderColor: "app.border.default" }}
            >
              <VStack align="stretch" gap={2} height="full">
                <VStack align="stretch" gap={1}>
                  <HStack justify="space-between" align="start">
                    <Heading4 fontSize="md" lineClamp={2}>{item.name}</Heading4>
                    {item.courseCode && (
                      <Badge variant="outline" size="sm" colorPalette={accentColorPalette}>
                        {item.courseCode}
                      </Badge>
                    )}
                  </HStack>

                  {item.institution && (
                    <Text fontSize="xs" fontWeight="medium" color="app.fg.muted">
                      {item.institution}
                    </Text>
                  )}
                </VStack>

                <Box mt="auto">
                  <HStack justify="space-between" align="center" pt={1}>
                    {timeframe ? (
                      <Text fontSize="xs" color={mutedColor}>
                        {timeframe}
                      </Text>
                    ) : <Box />}

                    {item.grade && (
                      <Text fontSize="xs" fontWeight="bold" color={accentColorPalette ? `${accentColorPalette}.fg` : "app.fg.default"}>
                        Grade: {item.grade}
                      </Text>
                    )}
                  </HStack>
                </Box>
              </VStack>
            </Box>
          );
        })}
      </SimpleGrid>
    </CvSection>
  );
}
