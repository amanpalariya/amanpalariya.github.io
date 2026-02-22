"use client";

import { EmptyState, VStack, Spacer, Box, Icon } from "@chakra-ui/react";
import { Heading1, SectionText, SubtitleText } from "@components/core/Texts";
import { TitleDescriptionAvatarTile } from "@components/core/Tiles";
import HighlightedSection from "@components/page/common/HighlightedSection";
import { homepageTabs } from "app/route-info";
import ProjectsData from "data/projects";
import { FiTool } from "react-icons/fi";
import { useFeatureFlag } from "utils/features";
import FeatureFlagsData from "data/features";

function Main() {
  return (
    <Box m={[4, 6]} letterSpacing={"wide"} lineHeight={"tall"}>
      <VStack align={"stretch"} gap={"5"}>
        <SectionText>{homepageTabs.projects.name}</SectionText>
        <Spacer h={4} />
        <Heading1>{ProjectsData.projectsPage.title}</Heading1>
        <SubtitleText>{ProjectsData.projectsPage.subtitle}</SubtitleText>
      </VStack>
    </Box>
  );
}

function NoProjectsElement() {
  return (
    <HighlightedSection>
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <Icon boxSize={12} color={"gray.500"}>
              <FiTool />
            </Icon>
          </EmptyState.Indicator>
          <EmptyState.Title>{"There are no projects yet!"}</EmptyState.Title>
        </EmptyState.Content>
      </EmptyState.Root>
    </HighlightedSection>
  );
}

function ProjectsListElement() {
  return (
    <HighlightedSection>
      <VStack align={"stretch"} gap={4}>
        {ProjectsData.allProjects.map((project) => (
          <TitleDescriptionAvatarTile
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
      </VStack>
    </HighlightedSection>
  );
}

function Projects() {
  const [, forceEmptyStates] = useFeatureFlag(
    FeatureFlagsData.featuresIds.FORCE_EMPTY_STATES,
  );

  return ProjectsData.allProjects.length != 0 && !forceEmptyStates
    ? ProjectsListElement()
    : NoProjectsElement();
}

export default function Home() {
  return (
    <VStack align={"stretch"}>
      <Main />
      <Projects />
    </VStack>
  );
}
