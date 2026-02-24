"use client";

import { VStack, Box } from "@chakra-ui/react";
import { CvData } from "data";
import CvHero from "@components/page/cv/CvHero";
import CvTimelineSection from "@components/page/cv/CvTimelineSection";
import CvSkillsSection from "@components/page/cv/CvSkillsSection";
import CvProjectsSection from "@components/page/cv/CvProjectsSection";
import CvJumpNav from "@components/page/cv/CvJumpNav";
import {
  FiBriefcase,
  FiGrid,
  FiTool,
  FiBookOpen,
} from "react-icons/fi";
import { useColorModeValue } from "@components/ui/color-mode";

export default function CvPage() {
  const { profile, sections } = CvData;
  const experienceBg = useColorModeValue("blue.50", "blue.950");
  const projectsBg = useColorModeValue("purple.50", "purple.950");
  const skillsBg = useColorModeValue("green.50", "green.950");
  const educationBg = useColorModeValue("orange.50", "orange.950");
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
        <CvTimelineSection
          section={sections.experience}
          titleIcon={FiBriefcase}
          background={experienceBg}
          accentColor="blue"
        />
      ) : null}
      {sections.projects ? (
        <CvProjectsSection
          section={sections.projects}
          titleIcon={FiGrid}
          background={projectsBg}
          accentColor="purple"
        />
      ) : null}
      {sections.skills ? (
        <CvSkillsSection
          section={sections.skills}
          titleIcon={FiTool}
          background={skillsBg}
          accentColor="green"
        />
      ) : null}
      {educationSection ? (
        <CvTimelineSection
          section={educationSection}
          titleIcon={FiBookOpen}
          background={educationBg}
          accentColor="orange"
        />
      ) : null}
    </VStack>
  );
}
