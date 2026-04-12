import { Box, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { CategoryBadge } from "@components/core/Badges";
import { Heading1 } from "@components/core/Texts";
import type { ReactNode } from "react";
import { FiBookOpen, FiCalendar, FiTool } from "react-icons/fi";
import type { ToolDefinition } from "../types";

function getToolIcon(icon?: string) {
  if (icon === "book") return FiBookOpen;
  if (icon === "calendar") return FiCalendar;
  return FiTool;
}

export function ToolDetailsSection({
  tool,
  titleAction,
}: {
  tool: ToolDefinition;
  titleAction?: ReactNode;
}) {
  const ToolIcon = getToolIcon(tool.icon);

  return (
    <VStack align={"stretch"} gap={4} pt={4}>
      <Box mx={[4, 6]} letterSpacing={"wide"}>
        <HStack justify={"space-between"} align={"center"} gap={3}>
          <HStack gap={3} align={"center"}>
            <Icon as={ToolIcon} color={"app.fg.subtle"} boxSize={6} />
            <Heading1>{tool.name}</Heading1>
          </HStack>
          {titleAction ?? null}
        </HStack>
      </Box>

      <HStack gap={3} wrap={"wrap"} align={"center"} px={[4, 6]}>
        {tool.status === "beta" ? <CategoryBadge color={"blue"}>Beta</CategoryBadge> : null}
        {tool.tags.map((tag) => (
          <CategoryBadge key={tag.id}>{tag.label}</CategoryBadge>
        ))}
      </HStack>

      <VStack align={"start"} gap={2} px={[4, 6]}>
        <Text color={"app.fg.muted"} fontSize={"md"} lineHeight={"1.6"}>
          {tool.description}
        </Text>
      </VStack>
    </VStack>
  );
}
