"use client";

import { VStack, Spacer, Box, Icon } from "@chakra-ui/react";
import { Heading1, SectionText, SubtitleText } from "@components/core/Texts";
import { TitleDescriptionAvatarTile } from "@components/core/Tiles";
import HighlightedSection from "@components/page/common/HighlightedSection";
import { homepageTabs } from "app/route-info";
import ProjectsData from "data/projects";
import { FiTool } from "react-icons/fi";

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
      <VStack align={"center"} gap={4} py={16}>
        <Icon boxSize={20} color={"gray.500"}>
          <FiTool />
        </Icon>
        <SubtitleText>{"There are no projects yet!"}</SubtitleText>
      </VStack>
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
  return ProjectsData.allProjects.length != 0
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
