import { HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { CategoryBadge, FeaturedIndicator } from "@components/core/Badges";
import { InnerBgCardWithHeader } from "@components/core/Cards";
import NextLink from "next/link";
import { FiBookOpen, FiChevronRight, FiTool } from "react-icons/fi";
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

export function ToolCard({ tool }: { tool: ToolDefinition }) {
  const ToolIcon = getToolIcon(tool.icon);

  return (
    <InnerBgCardWithHeader py={[2, 4]}>
      <NextLink href={tool.path} style={{ display: "block" }}>
        <VStack align={"stretch"} gap={3}>
          <HStack justify={"space-between"} align={"start"}>
            <VStack align={"start"} gap={1}>
              <HStack gap={2} align={"center"}>
                <Icon as={ToolIcon} boxSize={5} color={"app.fg.subtle"} />
                <Text fontSize={"md"} fontWeight={"medium"} color={"app.fg.default"}>
                  {tool.name}
                </Text>
                {tool.isFeatured ? <FeaturedIndicator /> : null}
              </HStack>
              <Text color={"app.fg.subtle"} fontSize={"sm"}>
                {tool.tagline}
              </Text>
            </VStack>

            <Icon color={"app.fg.icon"}>
              <FiChevronRight />
            </Icon>
          </HStack>

          <HStack justify={"space-between"} align={"center"} wrap={"wrap"}>
            <HStack gap={2} wrap={"wrap"}>
              <CategoryBadge color={statusColorMap[tool.status]}>
                {formatStatus(tool.status)}
              </CategoryBadge>
              <CategoryBadge>{tool.category}</CategoryBadge>
            </HStack>
          </HStack>
        </VStack>
      </NextLink>
    </InnerBgCardWithHeader>
  );
}
