"use client";

import { VStack, Spacer, Box } from "@chakra-ui/react";
import { Heading1, SectionText, SubtitleText } from "@components/core/Texts";
import { TitleDescriptionAvatarTile } from "@components/core/Tiles";
import BottomMessage from "@components/page/common/BottomMessage";
import HighlightedSection from "@components/page/common/HighlightedSection";
import ProjectsData from "data/project";

function Main() {
  return (
    <Box m={[4, 6]} letterSpacing={"wide"} lineHeight={"7"}>
      <VStack align={"stretch"} spacing={5}>
        <SectionText>Projects</SectionText>
        <Spacer h={4} />
        <Heading1>{ProjectsData.projectsPage.title}</Heading1>
        <SubtitleText>{ProjectsData.projectsPage.subtitle}</SubtitleText>
      </VStack>
    </Box>
  );
}

function Projects() {
  return (
    <HighlightedSection>
      <VStack align={"stretch"} spacing={4}>
        {ProjectsData.allProjects.map((project) => (
          <TitleDescriptionAvatarTile
            key={project.id}
            title={project.title}
            description={project.description}
            url={project.content ? project.id : project.url}
            isUrlExternal={project.content ? false : true}
          />
        ))}
      </VStack>
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
      <Projects />
    </VStack>
  );
}
