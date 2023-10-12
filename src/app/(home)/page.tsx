"use client";

import { VStack, HStack, Box } from "@chakra-ui/react";
import { FiChevronRight } from "react-icons/fi";
import { SectionText } from "@components/core/Texts";
import { TitleDescriptionAvatarTile } from "@components/core/Tiles";
import BottomMessage from "@components/page/common/BottomMessage";
import HighlightedSection, {
  SectionActionLink,
} from "@components/page/common/HighlightedSection";
import Profile from "@components/page/home/Profile";
import ProjectsData from "data/project";
import { homepageTabs } from "app/route-info";
import { WorkData } from "data";
import TimeBasedOnlineStatusBadge from "@components/page/home/TimeBasedOnlineStatusBadge";

function Main() {
  return (
    <Box m={[4, 6]}>
      <VStack align={"stretch"} spacing={8}>
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
  return (
    <HighlightedSection
      title="Projects"
      titleActionElement={
        <SectionActionLink
          icon={FiChevronRight}
          url={homepageTabs.project.pathname}
        >
          View All
        </SectionActionLink>
      }
    >
      <VStack align={"stretch"} spacing={4}>
        {ProjectsData.allProjects.slice(0, 3).map((project) => (
          <TitleDescriptionAvatarTile
            key={project.id}
            title={project.title}
            description={project.description}
            url={
              project.content
                ? homepageTabs.project.getSubpagePathname(project.id)
                : project.url
            }
            isUrlExternal={project.content ? false : true}
          />
        ))}
      </VStack>
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
  return (
    <HighlightedSection title="Work Experience">
      <VStack align={"stretch"} spacing={4}>
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
      <WorkExperience />
      <Projects />
      <ExtraInfo />
    </VStack>
  );
}
