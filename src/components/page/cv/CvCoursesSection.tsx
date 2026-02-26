import { Box, Text, VStack, Wrap, WrapItem } from "@chakra-ui/react";
import { Heading4 } from "@components/core/Texts";
import type { CvCourseItem, CvSectionBase } from "data/cv";
import type { ElementType } from "react";
import type { AppAccentPalette, AppPalette } from "theme/colors/types";
import CvSection from "./CvSection";
import { formatCvDate } from "./cvRenderUtils";

function toCourseMeta(course: CvCourseItem) {
  const timeframe = course.timeframe ?? formatCvDate(course.date);
  return [
    course.institution,
    timeframe,
    course.grade ? `Grade: ${course.grade}` : undefined,
  ]
    .filter(Boolean)
    .join(" · ");
}

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
      <Wrap gap={2} align="stretch">
        {section.items.map((item, index) => {
          const meta = toCourseMeta(item);
          return (
            <WrapItem
              key={`${item.name}-${index}`}
              flex="1 1 270px"
              minW="240px"
            >
              <Box
                w="full"
                borderWidth={1}
                borderColor={cardBorder}
                borderRadius="lg"
                p={3}
                bg={cardBg}
              >
                <VStack align="stretch" gap={1}>
                  <Heading4>{item.name}</Heading4>
                  {meta ? (
                    <Text fontSize="sm" color={mutedColor}>
                      {meta}
                    </Text>
                  ) : null}
                </VStack>
              </Box>
            </WrapItem>
          );
        })}
      </Wrap>
    </CvSection>
  );
}
