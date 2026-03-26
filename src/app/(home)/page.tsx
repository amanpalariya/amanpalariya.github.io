"use client";

import {
  EmptyState,
  VStack,
  HStack,
  Box,
  Icon,
  Link,
  QrCode,
  Text,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
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
import PersonalData from "data/Personal";
import TimeBasedOnlineStatusBadge from "@components/page/home/TimeBasedOnlineStatusBadge";
import { useFeatureFlag } from "utils/features";
import FeatureFlagsData from "data/features";
import { FiBriefcase, FiTool, FiChevronRight } from "react-icons/fi";
import { getAllTools } from "features/tools/data/tools-registry";

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
            url={project.url ?? homepageTabs.projects.getSubpagePathname(project.id)}
            isUrlExternal={project.url ? !project.url.startsWith("/") : false}
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
            compact
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

function getYearsOfExperience() {
  const earliestStart = WorkData.experience.reduce((start, exp) => {
    return exp.time.start < start ? exp.time.start : start;
  }, WorkData.experience[0]?.time.start ?? new Date());

  const years =
    (Date.now() - earliestStart.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(1, Math.floor(years));
}

function StatsAndQr() {
  const stats = [
    {
      label: "Projects",
      value: ProjectsData.allProjects.length,
    },
    {
      label: "Experience",
      value: `${getYearsOfExperience()}+ yrs`,
    },
    {
      label: "Tools",
      value: getAllTools().length,
    },
  ];

  return (
    <HighlightedSection title="Stats & QR" separateHeader>
      <VStack align={"stretch"} gap={6}>
        <Wrap gap={3}>
          {stats.map((stat) => (
            <WrapItem key={stat.label} flex={1} minW={"120px"}>
              <Box
                w={"full"}
                borderWidth={"thin"}
                borderColor={"app.border.default"}
                borderRadius={"xl"}
                px={4}
                py={3}
                background={"app.bg.cardHeader"}
              >
                <Text fontSize={"2xl"} fontWeight={"semibold"}>
                  {stat.value}
                </Text>
                <Text color={"app.fg.subtle"}>{stat.label}</Text>
              </Box>
            </WrapItem>
          ))}
        </Wrap>

        <VStack align={"center"} gap={3}>
          <Text color={"app.fg.subtle"} textAlign={"center"}>
            Scan to open LinkedIn profile
          </Text>
          <Box
            borderWidth={"thin"}
            borderColor={"app.border.default"}
            borderRadius={"xl"}
            p={3}
            background={"white"}
          >
            <QrCode.Root
              value={PersonalData.linkedIn.url}
              aria-label={"QR code for LinkedIn profile"}
            >
              <QrCode.Frame boxSize={"120px"}>
                <QrCode.Pattern />
              </QrCode.Frame>
            </QrCode.Root>
          </Box>
          <Link
            href={PersonalData.linkedIn.url}
            target={"_blank"}
            rel={"noreferrer"}
            color={"app.fg.subtle"}
            textDecoration={"underline"}
            textUnderlineOffset={"3px"}
          >
            {PersonalData.linkedIn.url}
          </Link>
        </VStack>
      </VStack>
    </HighlightedSection>
  );
}

export default function Home() {
  return (
    <VStack align={"stretch"}>
      <Main />
      <WorkExperience />
      <Projects />
      <StatsAndQr />
      <ExtraInfo />
    </VStack>
  );
}
