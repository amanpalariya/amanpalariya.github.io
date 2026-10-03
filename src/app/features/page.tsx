"use client";

import { EmptyState, VStack, Icon } from "@chakra-ui/react";
import PageIntro from "@components/page/common/PageIntro";
import { FeedList, TitleDescriptionToggleTile } from "@components/core/Tiles";
import ContentSection from "@components/page/common/ContentSection";
import WithBackground from "@components/page/wrapper/WithBackground";
import WithBodyCard from "@components/page/wrapper/WithBodyCard";
import WithHeader from "@components/page/wrapper/WithHeader";
import FeatureFlagsData, { FeatureFlagEntry } from "data/features";
import { FiTool } from "react-icons/fi";
import { useFeatureFlag } from "utils/features";

function Main() {
  return (
    <PageIntro
      title={FeatureFlagsData.featuresPage.title}
      subtitle={FeatureFlagsData.featuresPage.subtitle}
    />
  );
}

function NoFeatureFlagsElement() {
  return (
    <ContentSection>
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <Icon as={FiTool} boxSize={12} color={"gray.500"} />
          </EmptyState.Indicator>
          <EmptyState.Title textAlign={"center"}>
            {"There are no feature flags!"}
          </EmptyState.Title>
        </EmptyState.Content>
      </EmptyState.Root>
    </ContentSection>
  );
}

function FeatureFlagTile({ featureFlag }: { featureFlag: FeatureFlagEntry }) {
  const [featureFlagValue, setFeatureFlag] = useFeatureFlag(featureFlag.id);

  return (
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
    <FeedList>
      {FeatureFlagsData.flags.map((flag) => (
        <FeatureFlagTile key={flag.id} featureFlag={flag} />
      ))}
    </FeedList>
  );
}

function FeatureFlags() {
  return FeatureFlagsData.flags.length !== 0
    ? FeatureFlagsListElement()
    : NoFeatureFlagsElement();
}

export default function Home() {
  return (
    <WithBackground>
      <WithHeader>
        <WithBodyCard>
          <VStack align="stretch" gap={0}>
            <Main />
            <FeatureFlags />
          </VStack>
        </WithBodyCard>
      </WithHeader>
    </WithBackground>
  );
}
