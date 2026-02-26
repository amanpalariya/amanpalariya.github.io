"use client";

import { EmptyState, VStack, HStack, Box, Icon } from "@chakra-ui/react";
import { SectionText } from "@components/core/Texts";
import {
  TileList,
  TitleDescriptionAvatarTile,
  TitleDescriptionTile,
} from "@components/core/Tiles";
import BottomMessage from "@components/page/common/BottomMessage";
import HighlightedSection, {
  SectionActionLink,
} from "@components/page/common/HighlightedSection";
import Profile from "@components/page/home/Profile";
import ProjectsData from "data/projects";
import { homepageTabs } from "app/route-info";
import { WorkData } from "data";
import TimeBasedOnlineStatusBadge from "@components/page/home/TimeBasedOnlineStatusBadge";
import { useFeatureFlag } from "utils/features";
import FeatureFlagsData from "data/features";
import { FiBriefcase, FiTool, FiChevronRight } from "react-icons/fi";
import CvCtaSection from "@components/page/cv/CvCtaSection";

function Main() {
  return (
    <Box m={[4, 6]}>
      <VStack align={"stretch"} gap={8}>
        <HStack justify={"space-between"}>
          <SectionText>{WorkData.current.role}</SectionText>
          <TimeBasedOnlineStatusBadge />
        </HStack>
        <Profile />
      </VStack>
    </Box>
  );
}

function Projects() {
  const [, forceEmptyStates] = useFeatureFlag(
    FeatureFlagsData.featuresIds.FORCE_EMPTY_STATES,
  );

  if (forceEmptyStates || ProjectsData.allProjects.length == 0) {
    return (
      <HighlightedSection title="Projects">
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <Icon as={FiTool} boxSize={12} color={"gray.500"} />
            </EmptyState.Indicator>
            <EmptyState.Title textAlign={"center"}>
              {"There are no projects yet!"}
            </EmptyState.Title>
          </EmptyState.Content>
        </EmptyState.Root>
      </HighlightedSection>
    );
  }

  return (
    <HighlightedSection
      title="Projects"
      titleActionElement={
        <SectionActionLink
          icon={FiChevronRight}
          url={homepageTabs.projects.pathname}
        >
          View All
        </SectionActionLink>
      }
      separateHeader
    >
      <TileList>
        {ProjectsData.allProjects.slice(0, 3).map((project) => (
          <TitleDescriptionTile
            key={project.id}
            title={project.title}
            description={project.description}
            url={
              project.content
                ? homepageTabs.projects.getSubpagePathname(project.id)
                : project.url
            }
            isUrlExternal={project.content ? false : true}
          />
        ))}
      </TileList>
    </HighlightedSection>
  );
}

function getTimeStringFromExp(exp) {
  function formatDate(date: Date | null) {
    if (date) {
      const year = new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "short",
      }).format(date);
      return year;
    } else {
      return "Present";
    }
  }

  const startTime = formatDate(exp.time.start);
  const endTime = formatDate(exp.time.end);
  const time =
    startTime == endTime ? `${startTime}` : `${startTime} - ${endTime}`;

  return time;
}

function WorkExperience() {
  const [, forceEmptyStates] = useFeatureFlag(
    FeatureFlagsData.featuresIds.FORCE_EMPTY_STATES,
  );

  if (forceEmptyStates) {
    return (
      <HighlightedSection title="Work Experience">
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <Icon as={FiBriefcase} boxSize={12} color={"gray.500"} />
            </EmptyState.Indicator>
            <EmptyState.Title textAlign={"center"}>
              {"There is no work experience yet!"}
            </EmptyState.Title>
          </EmptyState.Content>
        </EmptyState.Root>
      </HighlightedSection>
    );
  }

  return (
    <HighlightedSection title="Work Experience" separateHeader>
      <TileList>
        {WorkData.experience.map((exp, index) => (
          <TitleDescriptionAvatarTile
            key={index}
            title={exp.company.name}
            description={`${exp.role} · ${getTimeStringFromExp(exp)}`}
            avatarSrc={exp.company.logoSrc}
            url={exp.url}
            isUrlExternal
          />
        ))}
      </TileList>
    </HighlightedSection>
  );
}

function ExtraInfo() {
  return <BottomMessage />;
}

export default function Home() {
  return (
    <VStack align={"stretch"}>
      <Main />
      <WorkExperience />
      <CvCtaSection />
      <Projects />
      <ExtraInfo />
    </VStack>
  );
}
