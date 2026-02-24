"use client";

import { VStack, Box } from "@chakra-ui/react";
import { CvData } from "data";
import CvHero from "@components/page/cv/CvHero";
import CvTimelineSection from "@components/page/cv/CvTimelineSection";
import CvSkillsSection from "@components/page/cv/CvSkillsSection";
import CvProjectsSection from "@components/page/cv/CvProjectsSection";
import CvJumpNav from "@components/page/cv/CvJumpNav";

export default function CvPage() {
  const { profile, sections } = CvData;
  const educationSection = sections.education
    ? {
        ...sections.education,
        items: sections.education.items.map((item) => ({
          title: item.degree,
          organization: item.institution,
          location: item.location,
          start: item.start,
          end: item.end,
          summary: item.summary,
          highlights: item.highlights,
        })),
      }
    : undefined;

  return (
    <VStack align="stretch" gap={2}>
      <Box m={[4, 6]}>
        <VStack align="stretch" gap={2}>
          <CvHero profile={profile} />
          <CvJumpNav sections={sections} />
        </VStack>
      </Box>
      {sections.experience ? (
        <CvTimelineSection section={sections.experience} />
      ) : null}
      {sections.projects ? (
        <CvProjectsSection section={sections.projects} />
      ) : null}
      {sections.skills ? <CvSkillsSection section={sections.skills} /> : null}
      {educationSection ? <CvTimelineSection section={educationSection} /> : null}
    </VStack>
  );
}
