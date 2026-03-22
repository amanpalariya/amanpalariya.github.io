import { Box, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { CategoryBadge } from "@components/core/Badges";
import { Heading3 } from "@components/core/Texts";
import { FiBookOpen, FiTool } from "react-icons/fi";
import type { ToolDefinition } from "../types";

const statusColorMap = {
  stable: "green",
  beta: "blue",
  alpha: "purple",
  archived: "gray",
} as const;

function formatStatus(value: ToolDefinition["status"]): string {
  return value[0].toUpperCase() + value.slice(1);
}

function getToolIcon(icon?: string) {
  if (icon === "book") return FiBookOpen;
  return FiTool;
}

export function ToolDetailsSection({ tool }: { tool: ToolDefinition }) {
  const ToolIcon = getToolIcon(tool.icon);

  return (
    <Box px={[4, 6]} pt={4}>
      <VStack align={"start"} gap={2}>
        <HStack gap={2} wrap={"wrap"}>
          <CategoryBadge color={statusColorMap[tool.status]}>
            {formatStatus(tool.status)}
          </CategoryBadge>
          <CategoryBadge>{tool.category}</CategoryBadge>
        </HStack>

        <HStack gap={2}>
          <Icon as={ToolIcon} color={"app.fg.subtle"} boxSize={5} />
          <Heading3>{tool.name}</Heading3>
        </HStack>

        <Text color={"app.fg.subtle"}>{tool.description}</Text>
      </VStack>
    </Box>
  );
}