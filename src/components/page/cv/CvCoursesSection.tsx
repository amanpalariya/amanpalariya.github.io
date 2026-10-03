import CvList from "./CvList";
import { Box, Text, VStack, HStack } from "@chakra-ui/react";
import { Heading4 } from "./CvTypography";
import type { CvCourseItem, CvSectionBase } from "data/cv";
import type { ElementType } from "react";
import type { AppAccentPalette, AppPalette } from "theme/colors/types";
import CvSection from "./CvSection";
import { formatCvDate } from "./cvRenderUtils";
import {
  CV_BODY_FONT_FAMILY,
  CV_META_TEXT_SIZE,
  CV_SECONDARY_TEXT_COLOR,
} from "./cvStyleTokens";

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

  const mutedColor = CV_SECONDARY_TEXT_COLOR;

  const resolvedAccentPalette = accentColorPalette ?? primaryColorPalette;
  const badgeColor = resolvedAccentPalette
    ? `${resolvedAccentPalette}.fg`
    : mutedColor;
  const badgeBg = resolvedAccentPalette
    ? `${resolvedAccentPalette}.subtle`
    : "app.bg.surface";

  return (
    <CvSection
      id={section.id}
      title={section.title}
      description={section.description}
      titleIcon={titleIcon}
      primaryColorPalette={primaryColorPalette}
      accentColorPalette={accentColorPalette}
    >
      <CvList>
        {section.items.map((item, index) => {
          const timeframe =
            item.timeframe ?? (item.date ? formatCvDate(item.date) : undefined);

          return (
            <Box
              key={`${item.name}-${index}`}
              borderRadius={0}
              bg="transparent"
              height="full"
            >
              <VStack align="stretch" gap={2} height="full">
                <VStack align="stretch" gap={1}>
                  <HStack justify="space-between" align="start">
                    <Heading4 lineClamp={2}>{item.name}</Heading4>
                    {item.courseCode && (
                      <Text
                        fontSize="14px"
                        px={2}
                        py={0.5}
                        borderRadius="md"
                        bg={badgeBg}
                        color={badgeColor}
                        whiteSpace="nowrap"
                        fontWeight="medium"
                        fontFamily={CV_BODY_FONT_FAMILY}
                      >
                        {item.courseCode}
                      </Text>
                    )}
                  </HStack>

                  {item.institution && (
                    <Text
                      fontSize={CV_META_TEXT_SIZE}
                      fontWeight="medium"
                      color="app.fg.muted"
                      fontFamily={CV_BODY_FONT_FAMILY}
                    >
                      {item.institution}
                    </Text>
                  )}
                </VStack>

                <Box mt="auto">
                  <HStack justify="space-between" align="center" pt={1}>
                    {timeframe ? (
                      <Text
                        fontSize={CV_META_TEXT_SIZE}
                        color={mutedColor}
                        fontFamily={CV_BODY_FONT_FAMILY}
                      >
                        {timeframe}
                      </Text>
                    ) : (
                      <Box />
                    )}

                    {item.grade && (
                      <Text
                        fontSize={CV_META_TEXT_SIZE}
                        fontWeight="bold"
                        fontFamily={CV_BODY_FONT_FAMILY}
                        color={
                          accentColorPalette
                            ? `${accentColorPalette}.fg`
                            : "app.fg.default"
                        }
                      >
                        Grade: {item.grade}
                      </Text>
                    )}
                  </HStack>
                </Box>
              </VStack>
            </Box>
          );
        })}
      </CvList>
    </CvSection>
  );
}
