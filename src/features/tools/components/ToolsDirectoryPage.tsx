"use client";

import { Box, EmptyState, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { CategoryBadge, FeaturedIndicator } from "@components/core/Badges";
import { Heading1, SubtitleText } from "@components/core/Texts";
import { TileList } from "@components/core/Tiles";
import HighlightedSection from "@components/page/common/HighlightedSection";
import NextLink from "next/link";
import { FiBookOpen, FiCalendar, FiChevronRight, FiTool } from "react-icons/fi";
import FeatureFlagsData from "data/features";
import { useFeatureFlag } from "utils/features";
import { getToolsPageContent } from "../data/content";
import { getAllTools } from "../data/tools-registry";
import { filterTools } from "../domain/search";
import type { ToolDefinition, ToolFiltersState } from "../types";
import { ToolsFilters } from "./ToolsFilters";
import { ToolsSearchBar } from "./ToolsSearchBar";
import { useMemo, useState } from "react";

const defaultFilters: ToolFiltersState = {
  query: "",
  category: "all",
  status: "all",
  featuredOnly: false,
};

const statusColorMap = {
  stable: "green",
  beta: "blue",
  alpha: "purple",
  archived: "gray",
} as const;

function getToolIcon(icon?: string) {
  if (icon === "book") return FiBookOpen;
  if (icon === "calendar") return FiCalendar;
  return FiTool;
}

function ToolListTile({ tool }: { tool: ToolDefinition }) {
  const ToolIcon = getToolIcon(tool.icon);

  return (
    <NextLink href={tool.path} style={{ display: "block" }}>
      <Box px={[1, 2]} py={[2, 3]}>
        <VStack align={"stretch"} gap={2}>
          <HStack justify={"space-between"} align={"start"}>
            <VStack align={"start"} gap={0}>
              <HStack gap={2} align={"center"}>
                <Icon as={ToolIcon} boxSize={5} color={"app.fg.subtle"} />
                <Text
                  fontSize={"lg"}
                  fontWeight={"medium"}
                  fontFamily={"heading"}
                  color={"app.fg.default"}
                >
                  {tool.name}
                </Text>
                {tool.isFeatured ? <FeaturedIndicator /> : null}
              </HStack>
              <Text color={"app.fg.subtle"} fontFamily={"body"}>
                {tool.tagline}
              </Text>
            </VStack>
            <Icon color={"app.fg.icon"} boxSize={5}>
              <FiChevronRight />
            </Icon>
          </HStack>

          <HStack gap={2} wrap={"wrap"}>
            <CategoryBadge color={statusColorMap[tool.status]}>{tool.status}</CategoryBadge>
            <CategoryBadge>{tool.category}</CategoryBadge>
          </HStack>
        </VStack>
      </Box>
    </NextLink>
  );
}

function Main({
  title,
  subtitle,
  showSearch,
  showFilters,
  filters,
  onFiltersChange,
  categories,
  statuses,
  searchPlaceholder,
}: {
  title: string;
  subtitle: string;
  showSearch: boolean;
  showFilters: boolean;
  filters: ToolFiltersState;
  onFiltersChange: (next: ToolFiltersState) => void;
  categories: Array<ToolDefinition["category"]>;
  statuses: Array<ToolDefinition["status"]>;
  searchPlaceholder: string;
}) {
  return (
    <Box m={[4, 6]} letterSpacing={"wide"} lineHeight={"tall"}>
      <VStack align={"stretch"} gap={5}>
        <Heading1>{title}</Heading1>
        {subtitle ? <SubtitleText>{subtitle}</SubtitleText> : null}

        {showSearch ? (
          <ToolsSearchBar
            value={filters.query}
            placeholder={searchPlaceholder}
            onChange={(query) => onFiltersChange({ ...filters, query })}
            onClear={() => onFiltersChange({ ...filters, query: "" })}
          />
        ) : null}

        {showFilters ? (
          <ToolsFilters
            filters={filters}
            categories={categories}
            statuses={statuses}
            onChange={onFiltersChange}
          />
        ) : null}
      </VStack>
    </Box>
  );
}

export function ToolsDirectoryPage() {
  const content = getToolsPageContent();
  const tools = getAllTools();
  const [, forceEmptyStates] = useFeatureFlag(
    FeatureFlagsData.featuresIds.FORCE_EMPTY_STATES,
  );
  const [filters, setFilters] = useState<ToolFiltersState>(defaultFilters);

  const categories = useMemo(
    () => Array.from(new Set(tools.map((tool) => tool.category))),
    [tools],
  );

  const statuses = useMemo(
    () => Array.from(new Set(tools.map((tool) => tool.status))),
    [tools],
  );

  const filteredTools = useMemo(() => filterTools(tools, filters), [tools, filters]);
  const visibleTools = forceEmptyStates ? [] : filteredTools;
  const showSearch = tools.length > 1;
  const showFilters = categories.length > 1 || statuses.length > 1;

  return (
    <VStack align={"stretch"} gap={0}>
      <Main
        title={content.title}
        subtitle={content.subtitle}
        showSearch={showSearch}
        showFilters={showFilters}
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
        statuses={statuses}
        searchPlaceholder={content.searchPlaceholder}
      />

      {visibleTools.length === 0 ? (
        <HighlightedSection>
          <EmptyState.Root>
            <EmptyState.Content>
              <EmptyState.Indicator>
                <Icon as={FiTool} boxSize={10} color={"app.fg.icon"} />
              </EmptyState.Indicator>
              <EmptyState.Title>{content.emptyStateTitle}</EmptyState.Title>
            </EmptyState.Content>
          </EmptyState.Root>
        </HighlightedSection>
      ) : (
        <HighlightedSection>
          <TileList>
            {visibleTools.map((tool) => (
              <ToolListTile key={tool.id} tool={tool} />
            ))}
          </TileList>
        </HighlightedSection>
      )}
    </VStack>
  );
}
