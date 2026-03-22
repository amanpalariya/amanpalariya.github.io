"use client";

import { Box, EmptyState, Icon, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { Heading1, SubtitleText } from "@components/core/Texts";
import { FiTool } from "react-icons/fi";
import { getToolsPageContent } from "../data/content";
import { getAllTools } from "../data/tools-registry";
import { filterTools } from "../domain/search";
import type { ToolFiltersState } from "../types";
import { ToolCard } from "./ToolCard";
import { ToolsFilters } from "./ToolsFilters";
import { ToolsSearchBar } from "./ToolsSearchBar";
import { useMemo, useState } from "react";

const defaultFilters: ToolFiltersState = {
  query: "",
  category: "all",
  status: "all",
  featuredOnly: false,
};

export function ToolsDirectoryPage() {
  const content = getToolsPageContent();
  const tools = getAllTools();
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
  const showSearch = tools.length > 1;
  const showFilters = categories.length > 1 || statuses.length > 1;

  return (
    <Box p={[4, 6]}>
      <VStack align={"stretch"} gap={5}>
        <Heading1>{content.title}</Heading1>
        {content.subtitle ? <SubtitleText>{content.subtitle}</SubtitleText> : null}

        {showSearch ? (
          <ToolsSearchBar
            value={filters.query}
            placeholder={content.searchPlaceholder}
            onChange={(query) => setFilters({ ...filters, query })}
            onClear={() => setFilters({ ...filters, query: "" })}
          />
        ) : null}

        {showFilters ? (
          <ToolsFilters
            filters={filters}
            categories={categories}
            statuses={statuses}
            onChange={setFilters}
          />
        ) : null}

        {filteredTools.length === 0 ? (
          <EmptyState.Root>
            <EmptyState.Content>
              <EmptyState.Indicator>
                <Icon as={FiTool} boxSize={10} color={"app.fg.icon"} />
              </EmptyState.Indicator>
              <EmptyState.Title>{content.emptyStateTitle}</EmptyState.Title>
              <EmptyState.Description>{content.emptyStateDescription}</EmptyState.Description>
            </EmptyState.Content>
          </EmptyState.Root>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Box>
  );
}
