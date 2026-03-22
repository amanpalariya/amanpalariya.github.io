"use client";

import { Badge, Box, Button, HStack, Text, VStack } from "@chakra-ui/react";
import { Switch } from "@components/ui/switch";
import type { ToolCategory, ToolFiltersState, ToolStatus } from "../types";

function FilterRow<T extends string>({
  label,
  allLabel,
  options,
  currentValue,
  onChange,
}: {
  label: string;
  allLabel: string;
  options: T[];
  currentValue: "all" | T;
  onChange: (value: "all" | T) => void;
}) {
  return (
    <VStack align={"start"} gap={2}>
      <Text fontSize={"sm"} color={"app.fg.subtle"}>
        {label}
      </Text>
      <HStack gap={2} wrap={"wrap"}>
        <Button
          size={"xs"}
          variant={currentValue === "all" ? "solid" : "surface"}
          borderRadius={"full"}
          onClick={() => onChange("all")}
        >
          {allLabel}
        </Button>
        {options.map((option) => {
          const active = currentValue === option;
          return (
            <Button
              key={option}
              size={"xs"}
              variant={active ? "solid" : "surface"}
              borderRadius={"full"}
              onClick={() => onChange(option)}
            >
              {option}
            </Button>
          );
        })}
      </HStack>
    </VStack>
  );
}

export function ToolsFilters({
  filters,
  categories,
  statuses,
  onChange,
}: {
  filters: ToolFiltersState;
  categories: ToolCategory[];
  statuses: ToolStatus[];
  onChange: (next: ToolFiltersState) => void;
}) {
  return (
    <VStack align={"stretch"} gap={3}>
      <FilterRow<ToolCategory>
        label={"Category"}
        allLabel={"All categories"}
        options={categories}
        currentValue={filters.category}
        onChange={(category) => onChange({ ...filters, category })}
      />

      <FilterRow<ToolStatus>
        label={"Status"}
        allLabel={"All status"}
        options={statuses}
        currentValue={filters.status}
        onChange={(status) => onChange({ ...filters, status })}
      />

      <Box>
        <Switch
          checked={filters.featuredOnly}
          onCheckedChange={(details) =>
            onChange({ ...filters, featuredOnly: details.checked })
          }
        >
          <HStack gap={2}>
            <Text>Featured only</Text>
            <Badge colorPalette={"orange"}>Featured</Badge>
          </HStack>
        </Switch>
      </Box>
    </VStack>
  );
}
