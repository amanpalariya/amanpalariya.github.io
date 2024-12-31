import {
  HStack,
  VStack,
  Icon,
  useBreakpointValue,
  Box,
  Text,
  LinkBox,
  LinkOverlay,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { FiChevronRight, FiArrowUpRight } from "react-icons/fi";
import { InnerCard } from "./Cards";
import { CategoryBadge } from "./Badges";
import { useColorModeValue } from "@components/ui/color-mode";
import { Avatar } from "@components/ui/avatar";

function LinkOverlayIfUrlPresent({
  children,
  url,
  isUrlExternal,
}: {
  children: any;
  url?: string;
  isUrlExternal?: boolean;
}) {
  return url ? (
    <LinkBox>
      <LinkOverlay target={isUrlExternal ? "_blank" : "_self"} asChild>
        <NextLink href={url ?? ""}>{children}</NextLink>
      </LinkOverlay>
    </LinkBox>
  ) : (
    <>{children}</>
  );
}

function LinkHelperIcon({ isExternal }) {
  return (
    <Icon color="gray.400" boxSize={5}>
      {isExternal ? <FiArrowUpRight /> : <FiChevronRight />}
    </Icon>
  );
}

export function TitleDescriptionAvatarTile({
  title,
  description,
  avatarSrc,
  url,
  isUrlExternal = false,
}: {
  title: string;
  description: string;
  avatarSrc?: string;
  url?: string;
  isUrlExternal?: boolean;
}) {
  const showDescriptionBelow = useBreakpointValue([true, false]);

  const descriptionJsx = <Text color={"gray.500"}>{description}</Text>;

  return (
    <LinkOverlayIfUrlPresent url={url} isUrlExternal={isUrlExternal}>
      <InnerCard>
        <VStack align={"stretch"}>
          <HStack justify={"space-between"}>
            <HStack gap={4}>
              <Box
                rounded={"full"}
                p={1.5}
                borderWidth={"medium"}
                borderColor={useColorModeValue("gray.200", "gray.600")}
              >
                <Avatar size={"md"} name={title} src={avatarSrc} />
              </Box>
              <VStack align={"start"}>
                <Text fontSize={"lg"}>{title}</Text>
                {showDescriptionBelow ? null : descriptionJsx}
              </VStack>
            </HStack>
            {url ? <LinkHelperIcon isExternal={isUrlExternal} /> : null}
          </HStack>
          <Box mx={2}>{showDescriptionBelow ? descriptionJsx : null}</Box>
        </VStack>
      </InnerCard>
    </LinkOverlayIfUrlPresent>
  );
}

export function TitleCategoryAvatarTile({
  title,
  categories,
  avatarSrc,
  url,
  isUrlExternal = false,
}: {
  title: string;
  categories: string[];
  avatarSrc?: string;
  url?: string;
  isUrlExternal?: boolean;
}) {
  const showBadgeBelow = useBreakpointValue([true, false]);

  const categoryRow = (
    <HStack>
      {categories.map((category, index) => (
        <CategoryBadge key={index}>{category}</CategoryBadge>
      ))}
    </HStack>
  );

  return (
    <LinkOverlayIfUrlPresent url={url} isUrlExternal={isUrlExternal}>
      <InnerCard>
        <VStack align={"stretch"}>
          <HStack justify={"space-between"}>
            <HStack gap={4}>
              <Box
                rounded={"full"}
                p={1.5}
                borderWidth={"medium"}
                borderColor={useColorModeValue("gray.200", "gray.600")}
              >
                <Avatar size={"sm"} name={title} src={avatarSrc} />
              </Box>
              <VStack align={"start"}>
                <Text fontSize={"lg"}>{title}</Text>
              </VStack>
            </HStack>
            <HStack gap={4}>
              {showBadgeBelow ? null : categoryRow}
              {url ? <LinkHelperIcon isExternal={isUrlExternal} /> : null}
            </HStack>
          </HStack>
          <Box>{showBadgeBelow ? categoryRow : null}</Box>
        </VStack>
      </InnerCard>
    </LinkOverlayIfUrlPresent>
  );
}
