"use client";

import { EmptyState, VStack, Spacer, Box, Icon, Skeleton } from "@chakra-ui/react";
import { Heading1, SectionText, SubtitleText } from "@components/core/Texts";
import { TitleDescriptionToggleTile } from "@components/core/Tiles";
import HighlightedSection from "@components/page/common/HighlightedSection";
import WithBackground from "@components/page/wrapper/WithBackground";
import WithBodyCard from "@components/page/wrapper/WithBodyCard";
import WithHeader from "@components/page/wrapper/WithHeader";
import FeatureFlagsData, { FeatureFlagEntry } from "data/features";
import { FiTool } from "react-icons/fi";
import { useFeatureFlag } from "utils/features";

function Main() {
  return (
    <Box m={[4, 6]} letterSpacing={"wide"} lineHeight={"tall"}>
      <VStack align={"stretch"} gap={5}>
        <SectionText>{FeatureFlagsData.featuresPage.title}</SectionText>
        <Spacer h={4} />
        <Heading1>{FeatureFlagsData.featuresPage.title}</Heading1>
        <SubtitleText>{FeatureFlagsData.featuresPage.subtitle}</SubtitleText>
      </VStack>
    </Box>
  );
}

function NoFeatureFlagsElement() {
  return (
    <HighlightedSection>
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <Icon as={FiTool} boxSize={12} color={"gray.500"} />
          </EmptyState.Indicator>
          <EmptyState.Title>{"There are no feature flags!"}</EmptyState.Title>
        </EmptyState.Content>
      </EmptyState.Root>
    </HighlightedSection>
  );
}

function FeatureFlagTile({ featureFlag }: { featureFlag: FeatureFlagEntry }) {
  const [isLoading, featureFlagValue, setFeatureFlag] = useFeatureFlag(
    featureFlag.id,
  );

  return isLoading ? (
    <Skeleton w={"full"} h={"24"} rounded={"2xl"} />
  ) : (
    <TitleDescriptionToggleTile
      title={featureFlag.name}
      description={featureFlag.desc}
      toggleValue={featureFlagValue}
      onToggle={setFeatureFlag}
    />
  );
}

function FeatureFlagsListElement() {
  return (
    <HighlightedSection>
      <VStack align={"stretch"} gap={4}>
        {FeatureFlagsData.flags.map((flag) => (
          <FeatureFlagTile key={flag.id} featureFlag={flag} />
        ))}
      </VStack>
    </HighlightedSection>
  );
}

function FeatureFlags() {
  return FeatureFlagsData.flags.length != 0
    ? FeatureFlagsListElement()
    : NoFeatureFlagsElement();
}

export default function Home() {
  return (
    <WithBackground>
      <WithHeader>
        <WithBodyCard>
          <VStack align={"stretch"}>
            <Main />
            <FeatureFlags />
          </VStack>
        </WithBodyCard>
      </WithHeader>
    </WithBackground>
  );
}
