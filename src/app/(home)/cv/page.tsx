"use client";

import { VStack, Box } from "@chakra-ui/react";
import { SectionText } from "@components/core/Texts";
import { CvData } from "data";
import CvHero from "@components/page/cv/CvHero";
import CvTimelineSection from "@components/page/cv/CvTimelineSection";
import CvSkillsSection from "@components/page/cv/CvSkillsSection";
import CvProjectsSection from "@components/page/cv/CvProjectsSection";
import CvJumpNav from "@components/page/cv/CvJumpNav";
import CvTextSection from "@components/page/cv/CvTextSection";
import CvContactSection from "@components/page/cv/CvContactSection";
import CvBadgeListSection from "@components/page/cv/CvBadgeListSection";
import CvAccomplishmentsSection from "@components/page/cv/CvAccomplishmentsSection";
import CvCoursesSection from "@components/page/cv/CvCoursesSection";
import CvLanguagesSection from "@components/page/cv/CvLanguagesSection";
import {
  FiUser,
  FiTarget,
  FiBriefcase,
  FiGrid,
  FiTool,
  FiBookOpen,
  FiHeart,
  FiAward,
  FiGlobe,
  FiBook,
  FiUsers,
  FiMail,
} from "react-icons/fi";
import { useColorModeValue } from "@components/ui/color-mode";
import {
  getRenderableCvSections,
  mapAwardsToTimelineItems,
  mapEducationToTimelineItems,
  mapVolunteeringToTimelineItems,
} from "@components/page/cv/cvRenderUtils";
import type {
  CvAwardItem,
  CvCertificationItem,
  CvOrganizationItem,
} from "data/cv";

const SECTION_ACCENTS: Record<string, "blue" | "purple" | "green" | "orange" | "yellow" | "red"> = {
  about: "blue",
  "open-to": "purple",
  experience: "blue",
  projects: "purple",
  skills: "green",
  education: "orange",
  volunteering: "green",
  certifications: "blue",
  languages: "orange",
  courses: "yellow",
  honors: "red",
  organizations: "purple",
  contact: "blue",
};

function toVisualItems(
  items: CvCertificationItem[] | CvAwardItem[] | CvOrganizationItem[],
) {
  return items.map((item) => {
    if ("issuer" in item || "credentialUrl" in item) {
      const cert = item as CvCertificationItem;
      return {
        title: cert.title,
        meta: cert.issuer ?? cert.date,
        summary: cert.summary,
        tags: cert.tags,
        url: cert.credentialUrl,
      };
    }

    if ("role" in item) {
      const org = item as CvOrganizationItem;
      return {
        title: org.name,
        meta: [org.role, org.start, org.end].filter(Boolean).join(" · "),
        summary: org.summary,
      };
    }

    if ("date" in item && "issuer" in item) {
      const award = item as CvAwardItem;
      return {
        title: award.title,
        meta: [award.issuer, award.date].filter(Boolean).join(" · "),
        summary: award.summary,
      };
    }

    const award = item as CvAwardItem;
    return {
      title: award.title,
      meta: [award.issuer, award.date].filter(Boolean).join(" · "),
      summary: award.summary,
    };
  });
}

export default function CvPage() {
  const { profile, sections } = CvData;
  const sectionBg = {
    blue: useColorModeValue("blue.50", "blue.950"),
    purple: useColorModeValue("purple.50", "purple.950"),
    green: useColorModeValue("green.50", "green.950"),
    orange: useColorModeValue("orange.50", "orange.950"),
    yellow: useColorModeValue("yellow.50", "yellow.950"),
    red: useColorModeValue("red.50", "red.950"),
  };

  const renderableSections = getRenderableCvSections(sections);

  const educationTimeline = sections.education
    ? {
        ...sections.education,
        items: mapEducationToTimelineItems(sections.education.items),
      }
    : undefined;

  const volunteeringTimeline = sections.volunteering
    ? {
        ...sections.volunteering,
        items: mapVolunteeringToTimelineItems(sections.volunteering.items),
      }
    : undefined;

  const awardsTimeline = sections.awards
    ? {
        ...sections.awards,
        items: mapAwardsToTimelineItems(sections.awards.items),
      }
    : undefined;

  function getSectionTheme(sectionId: string) {
    const accent = SECTION_ACCENTS[sectionId] ?? "blue";
    return {
      accent,
      background: sectionBg[accent],
    };
  }

  function renderSectionById(sectionId: string) {
    const { accent, background } = getSectionTheme(sectionId);

    switch (sectionId) {
      case "about":
        return sections.about ? (
          <CvTextSection
            key={sections.about.id}
            section={sections.about}
            titleIcon={FiUser}
            background={background}
            accentColor={accent}
          />
        ) : null;

      case "open-to":
        return sections.openTo ? (
          <CvBadgeListSection
            key={sections.openTo.id}
            section={sections.openTo}
            items={sections.openTo.roles}
            titleIcon={FiTarget}
            background={background}
            accentColor={accent}
          />
        ) : null;

      case "experience":
        return sections.experience ? (
          <CvTimelineSection
            key={sections.experience.id}
            section={sections.experience}
            titleIcon={FiBriefcase}
            background={background}
            accentColor={accent}
          />
        ) : null;

      case "projects":
        return sections.projects ? (
          <CvProjectsSection
            key={sections.projects.id}
            section={sections.projects}
            titleIcon={FiGrid}
            background={background}
            accentColor={accent}
          />
        ) : null;

      case "skills":
        return sections.skills ? (
          <CvSkillsSection
            key={sections.skills.id}
            section={sections.skills}
            titleIcon={FiTool}
            background={background}
            accentColor={accent}
          />
        ) : null;

      case "education":
        return educationTimeline ? (
          <CvTimelineSection
            key={educationTimeline.id}
            section={educationTimeline}
            titleIcon={FiBookOpen}
            background={background}
            accentColor={accent}
          />
        ) : null;

      case "volunteering":
        return volunteeringTimeline ? (
          <CvTimelineSection
            key={volunteeringTimeline.id}
            section={volunteeringTimeline}
            titleIcon={FiHeart}
            background={background}
            accentColor={accent}
          />
        ) : null;

      case "certifications":
        return sections.certifications ? (
          <CvAccomplishmentsSection
            key={sections.certifications.id}
            section={sections.certifications}
            items={toVisualItems(sections.certifications.items)}
            titleIcon={FiAward}
            background={background}
            accentColor={accent}
          />
        ) : null;

      case "languages":
        return sections.languages ? (
          <CvLanguagesSection
            key={sections.languages.id}
            section={sections.languages}
            titleIcon={FiGlobe}
            background={background}
            accentColor={accent}
          />
        ) : null;

      case "courses":
        return sections.courses ? (
          <CvCoursesSection
            key={sections.courses.id}
            section={sections.courses}
            titleIcon={FiBook}
            background={background}
            accentColor={accent}
          />
        ) : null;

      case "honors":
        return awardsTimeline ? (
          <CvTimelineSection
            key={awardsTimeline.id}
            section={awardsTimeline}
            titleIcon={FiAward}
            background={background}
            accentColor={accent}
          />
        ) : null;

      case "organizations":
        return sections.organizations ? (
          <CvAccomplishmentsSection
            key={sections.organizations.id}
            section={sections.organizations}
            items={toVisualItems(sections.organizations.items)}
            titleIcon={FiUsers}
            background={background}
            accentColor={accent}
          />
        ) : null;

      case "contact":
        return sections.contact ? (
          <CvContactSection
            key={sections.contact.id}
            section={sections.contact}
            titleIcon={FiMail}
            background={background}
            accentColor={accent}
          />
        ) : null;

      default:
        return null;
    }
  }

  return (
    <VStack align="stretch" gap={2}>
      <Box m={[4, 6]}>
        <VStack align="stretch" gap={5}>
          <VStack align="stretch" gap={2} letterSpacing="wide" lineHeight="tall">
            <SectionText>Curriculum Vitae</SectionText>
          </VStack>
          <CvHero profile={profile} />
          <CvJumpNav sections={sections} />
        </VStack>
      </Box>
      {renderableSections.map((section) => renderSectionById(section.id))}
    </VStack>
  );
}
