"use client";

import {
  EmptyState,
  HStack,
  Icon,
  LinkBox,
  LinkOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import { CategoryBadge, FeaturedIndicator } from "@components/core/Badges";
import PageIntro from "@components/page/common/PageIntro";
import { FeedList, TileBody } from "@components/core/Tiles";
import ContentSection from "@components/page/common/ContentSection";
import NextLink from "next/link";
import { FiBookOpen, FiCalendar, FiChevronRight, FiTool } from "react-icons/fi";
import FeatureFlagsData from "data/features";
import { useFeatureFlag } from "utils/features";
import { getToolsPageContent } from "../data/content";
import { getAllTools } from "../data/tools-registry";
import { filterTools } from "../domain/search";
import type { ToolDefinition, ToolFiltersState } from "../types";
import { ToolsSearchBar } from "./ToolsSearchBar";
import { useMemo, useState } from "react";

const defaultFilters: ToolFiltersState = {
  query: "",
};

function getToolIcon(icon?: string) {
  if (icon === "book") return FiBookOpen;
  if (icon === "calendar") return FiCalendar;
  return FiTool;
}

function ToolListTile({ tool }: { tool: ToolDefinition }) {
  const ToolIcon = getToolIcon(tool.icon);

  return (
    <LinkBox>
      <TileBody>
        <VStack align={"stretch"} gap={2}>
          <HStack justify={"space-between"} align={"start"}>
            <VStack align={"start"} gap={0}>
              <HStack gap={2} align={"center"}>
                <Icon as={ToolIcon} boxSize={5} color={"app.fg.subtle"} />
                <Text
                  fontSize="16px"
                  fontWeight={700}
                  fontFamily={"heading"}
                  color={"app.fg.default"}
                >
                  {tool.name}
                </Text>
                {tool.isFeatured ? <FeaturedIndicator /> : null}
              </HStack>
              <Text
                color="app.prose.body"
                fontFamily="body"
                fontSize="15px"
                lineHeight="1.5"
              >
                {tool.tagline}
              </Text>
            </VStack>
            <Icon color={"app.fg.icon"} boxSize={5}>
              <FiChevronRight />
            </Icon>
          </HStack>

          <HStack gap={2} wrap={"wrap"}>
            {tool.status === "beta" ? (
              <CategoryBadge color={"blue"}>Beta</CategoryBadge>
            ) : null}
            {tool.tags.map((tag) => (
              <CategoryBadge key={tag.id}>{tag.label}</CategoryBadge>
            ))}
          </HStack>
        </VStack>
      </TileBody>
      <LinkOverlay as={NextLink} href={tool.path} aria-label={tool.name} />
    </LinkBox>
  );
}

function Main({
  title,
  subtitle,
  showSearch,
  filters,
  onFiltersChange,
  searchPlaceholder,
}: {
  title: string;
  subtitle: string;
  showSearch: boolean;
  filters: ToolFiltersState;
  onFiltersChange: (next: ToolFiltersState) => void;
  searchPlaceholder: string;
}) {
  return (
    <PageIntro title={title} subtitle={subtitle}>
      {showSearch ? (
        <ToolsSearchBar
          value={filters.query}
          placeholder={searchPlaceholder}
          onChange={(query) => onFiltersChange({ ...filters, query })}
          onClear={() => onFiltersChange({ ...filters, query: "" })}
        />
      ) : null}
    </PageIntro>
  );
}

export function ToolsDirectoryPage() {
  const content = getToolsPageContent();
  const tools = getAllTools();
  const [forceEmptyStates] = useFeatureFlag(
    FeatureFlagsData.featuresIds.FORCE_EMPTY_STATES,
  );
  const [filters, setFilters] = useState<ToolFiltersState>(defaultFilters);

  const filteredTools = useMemo(
    () => filterTools(tools, filters),
    [tools, filters],
  );
  const visibleTools = forceEmptyStates ? [] : filteredTools;
  const showSearch = tools.length > 5;

  return (
    <VStack align={"stretch"} gap={0}>
      <Main
        title={content.title}
        subtitle={content.subtitle}
        showSearch={showSearch}
        filters={filters}
        onFiltersChange={setFilters}
        searchPlaceholder={content.searchPlaceholder}
      />

      {visibleTools.length === 0 ? (
        <ContentSection borderTop={0}>
          <EmptyState.Root>
            <EmptyState.Content>
              <EmptyState.Indicator>
                <Icon as={FiTool} boxSize={10} color={"app.fg.icon"} />
              </EmptyState.Indicator>
              <EmptyState.Title>{content.emptyStateTitle}</EmptyState.Title>
            </EmptyState.Content>
          </EmptyState.Root>
        </ContentSection>
      ) : (
        <FeedList>
          {visibleTools.map((tool) => (
            <ToolListTile key={tool.id} tool={tool} />
          ))}
        </FeedList>
      )}
    </VStack>
  );
}
