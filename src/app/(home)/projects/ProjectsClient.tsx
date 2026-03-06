"use client";

import { EmptyState, VStack, Spacer, Box, Icon } from "@chakra-ui/react";
import { Heading1, SectionText, SubtitleText } from "@components/core/Texts";
import { TileList, TitleDescriptionTile } from "@components/core/Tiles";
import HighlightedSection from "@components/page/common/HighlightedSection";
import { homepageTabs } from "app/route-info";
import ProjectsData from "data/projects";
import type { ProjectMeta } from "data/projects/loader";
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
          <EmptyState.Title textAlign={"center"}>
            {"There are no projects yet!"}
          </EmptyState.Title>
        </EmptyState.Content>
      </EmptyState.Root>
    </HighlightedSection>
  );
}

function ProjectsListElement({
  projects,
  projectIdsWithDetails,
}: {
  projects: ProjectMeta[];
  projectIdsWithDetails: string[];
}) {
  const projectDetailsIdsSet = new Set(projectIdsWithDetails);

  return (
    <HighlightedSection>
      <TileList>
        {projects.map((project) => {
          const hasDetails = projectDetailsIdsSet.has(project.id);
          return (
            <TitleDescriptionTile
              key={project.id}
              title={project.title}
              description={project.description}
              url={
                hasDetails
                  ? homepageTabs.projects.getSubpagePathname(project.id)
                  : project.url
              }
              isUrlExternal={!hasDetails}
            />
          );
        })}
      </TileList>
    </HighlightedSection>
  );
}

function Projects({
  projects,
  projectIdsWithDetails,
}: {
  projects: ProjectMeta[];
  projectIdsWithDetails: string[];
}) {
  const [, forceEmptyStates] = useFeatureFlag(
    FeatureFlagsData.featuresIds.FORCE_EMPTY_STATES,
  );

  return projects.length != 0 && !forceEmptyStates ? (
    <ProjectsListElement
      projects={projects}
      projectIdsWithDetails={projectIdsWithDetails}
    />
  ) : (
    NoProjectsElement()
  );
}

export default function ProjectsClient({
  projects,
  projectIdsWithDetails,
}: {
  projects: ProjectMeta[];
  projectIdsWithDetails: string[];
}) {
  return (
    <VStack align={"stretch"}>
      <Main />
      <Projects
        projects={projects}
        projectIdsWithDetails={projectIdsWithDetails}
      />
    </VStack>
  );
}
