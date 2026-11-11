"use client";

import { EmptyState, VStack, Icon } from "@chakra-ui/react";
import {
  FeaturedTile,
  FeedList,
  TitleDescriptionTile,
} from "@components/core/Tiles";
import ContentSection from "@components/page/common/ContentSection";
import { homepageTabs } from "app/route-info";
import ProjectsData from "data/projects";
import type { ProjectMeta } from "data/projects/loader";
import { FiTool } from "react-icons/fi";
import { useFeatureFlag } from "utils/features";
import FeatureFlagsData from "data/features";

function NoProjectsElement() {
  return (
    <ContentSection borderTop={0}>
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <Icon boxSize={12} color={"gray.500"}>
              <FiTool />
            </Icon>
          </EmptyState.Indicator>
          <EmptyState.Title as="h1" textAlign={"center"}>
            {ProjectsData.projectsPage.emptyStateTitle}
          </EmptyState.Title>
        </EmptyState.Content>
      </EmptyState.Root>
    </ContentSection>
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

  const [featured, ...remainingProjects] = projects;
  if (!featured) return null;
  const featuredHasDetails = projectDetailsIdsSet.has(featured.id);

  return (
    <>
      <FeaturedTile
        title={featured.title}
        description={featured.description}
        iconSrc={featured.iconSrc}
        url={
          featuredHasDetails
            ? homepageTabs.projects.getSubpagePathname(featured.id)
            : featured.url
        }
        isUrlExternal={!featuredHasDetails}
        actionLabel="View project"
      />
      {remainingProjects.length > 0 ? (
        <FeedList>
          {remainingProjects.map((project) => {
            const hasDetails = projectDetailsIdsSet.has(project.id);
            return (
              <TitleDescriptionTile
                key={project.id}
                title={project.title}
                description={project.description}
                iconSrc={project.iconSrc}
                url={
                  hasDetails
                    ? homepageTabs.projects.getSubpagePathname(project.id)
                    : project.url
                }
                isUrlExternal={!hasDetails}
              />
            );
          })}
        </FeedList>
      ) : null}
    </>
  );
}

function Projects({
  projects,
  projectIdsWithDetails,
}: {
  projects: ProjectMeta[];
  projectIdsWithDetails: string[];
}) {
  const [forceEmptyStates] = useFeatureFlag(
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
    <VStack align="stretch" gap={0}>
      <Projects
        projects={projects}
        projectIdsWithDetails={projectIdsWithDetails}
      />
    </VStack>
  );
}
