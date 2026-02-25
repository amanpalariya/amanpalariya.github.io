import {
  HStack,
  VStack,
  Icon,
  useBreakpointValue,
  Box,
  Text,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { Children } from "react";
import { FiChevronRight, FiArrowUpRight } from "react-icons/fi";
import { CategoryBadge } from "./Badges";
import { useColorModeValue } from "@components/ui/color-mode";
import { Avatar } from "@components/ui/avatar";
import { Switch } from "@components/ui/switch";

function FlatTile({ children }: { children: React.ReactNode }) {
  return (
    <Box
      px={[1, 2]}
      py={[3, 4]}
    >
      {children}
    </Box>
  );
}

export function TileList({ children }: { children: React.ReactNode }) {
  const items = Children.toArray(children).filter(Boolean);
  const dividerColor = useColorModeValue("gray.200", "gray.700");

  return (
    <VStack align={"stretch"} gap={0}>
      {items.map((child, index) => (
        <Box
          key={index}
          borderBottomWidth={index < items.length - 1 ? "1px" : "0px"}
          borderBottomColor={dividerColor}
        >
          {child}
        </Box>
      ))}
    </VStack>
  );
}

function LinkOverlayIfUrlPresent({
  children,
  url,
  isUrlExternal,
}: {
  children: any;
  url?: string;
  isUrlExternal?: boolean;
}) {
  if (!url) return <>{children}</>;

  if (isUrlExternal) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        style={{ display: "block" }}
      >
        {children}
      </a>
    );
  }

  return (
    <NextLink href={url} style={{ display: "block" }}>
      {children}
    </NextLink>
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
  const descriptionColor = useColorModeValue("gray.500", "gray.300");

  const descriptionJsx = <Text color={descriptionColor}>{description}</Text>;

  return (
    <LinkOverlayIfUrlPresent url={url} isUrlExternal={isUrlExternal}>
      <FlatTile>
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
      </FlatTile>
    </LinkOverlayIfUrlPresent>
  );
}

function formatBlogDateLabel({
  published,
  updated,
}: {
  published?: string;
  updated?: string;
}) {
  if (!published) return null;

  const publishedDate = new Date(published);
  if (Number.isNaN(publishedDate.getTime())) return null;

  const publishedLabel = publishedDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  if (!updated) return publishedLabel;

  const updatedDate = new Date(updated);
  if (Number.isNaN(updatedDate.getTime())) return publishedLabel;

  const updatedLabel = updatedDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return `${publishedLabel} · Updated ${updatedLabel}`;
}

export function TitleDescriptionTile({
  title,
  description,
  url,
  isUrlExternal = false,
}: {
  title: string;
  description: string;
  url?: string;
  isUrlExternal?: boolean;
}) {
  const descriptionColor = useColorModeValue("gray.500", "gray.300");

  const descriptionJsx = <Text color={descriptionColor}>{description}</Text>;

  return (
    <LinkOverlayIfUrlPresent url={url} isUrlExternal={isUrlExternal}>
      <FlatTile>
        <VStack align={"stretch"}>
          <HStack justify={"space-between"} align={"start"}>
            <VStack align={"start"} gap={1}>
              <Text fontSize={"lg"}>{title}</Text>
              {descriptionJsx}
            </VStack>
            {url ? <LinkHelperIcon isExternal={isUrlExternal} /> : null}
          </HStack>
        </VStack>
      </FlatTile>
    </LinkOverlayIfUrlPresent>
  );
}

export function TitleDescriptionMetaTile({
  title,
  description,
  tags,
  published,
  updated,
  url,
  isUrlExternal = false,
}: {
  title: string;
  description: string;
  tags?: string[];
  published?: string;
  updated?: string;
  url?: string;
  isUrlExternal?: boolean;
}) {
  const descriptionColor = useColorModeValue("gray.500", "gray.300");
  const metadataColor = useColorModeValue("gray.500", "gray.300");

  const descriptionJsx = <Text color={descriptionColor}>{description}</Text>;
  const metadataLabel = formatBlogDateLabel({ published, updated });

  return (
    <LinkOverlayIfUrlPresent url={url} isUrlExternal={isUrlExternal}>
      <FlatTile>
        <VStack align={"stretch"} gap={2}>
          <HStack justify={"space-between"} align={"start"}>
            <VStack align={"start"} gap={0}>
              <Text fontSize={"lg"}>{title}</Text>
              {descriptionJsx}
            </VStack>
            {url ? <LinkHelperIcon isExternal={isUrlExternal} /> : null}
          </HStack>

          {metadataLabel ? (
            <Text fontSize={"sm"} color={metadataColor}>
              {metadataLabel}
            </Text>
          ) : null}

          {tags && tags.length > 0 ? (
            <Wrap gap={2}>
              {tags.map((tag, index) => (
                <WrapItem key={index}>
                  <CategoryBadge>{tag}</CategoryBadge>
                </WrapItem>
              ))}
            </Wrap>
          ) : null}
        </VStack>
      </FlatTile>
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
      <FlatTile>
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
      </FlatTile>
    </LinkOverlayIfUrlPresent>
  );
}

export function TitleDescriptionAvatarToggleTile({
  title,
  description,
  avatarSrc,
  url,
  toggleValue,
  onToggle,
  isUrlExternal = false,
}: {
  title: string;
  description: string;
  avatarSrc?: string;
  url?: string;
  toggleValue?: boolean;
  onToggle?: (checked: boolean) => void;
  isUrlExternal?: boolean;
}) {
  return (
    <TitleDescriptionToggleTile
      title={title}
      description={description}
      url={url}
      toggleValue={toggleValue}
      onToggle={onToggle}
      isUrlExternal={isUrlExternal}
    />
  );
}

export function TitleDescriptionToggleTile({
  title,
  description,
  url,
  toggleValue,
  onToggle,
  isUrlExternal = false,
}: {
  title: string;
  description: string;
  url?: string;
  toggleValue?: boolean;
  onToggle?: (checked: boolean) => void;
  isUrlExternal?: boolean;
}) {
  const descriptionColor = useColorModeValue("gray.500", "gray.300");

  const descriptionJsx = <Text color={descriptionColor}>{description}</Text>;

  return (
    <LinkOverlayIfUrlPresent url={url} isUrlExternal={isUrlExternal}>
      <FlatTile>
        <VStack align={"stretch"}>
          <HStack justify={"space-between"}>
            <VStack align={"start"}>
              <Text fontSize={"lg"}>{title}</Text>
              {descriptionJsx}
            </VStack>
            <Switch
              checked={toggleValue}
              onCheckedChange={(details) => onToggle?.(details.checked)}
            />
          </HStack>
        </VStack>
      </FlatTile>
    </LinkOverlayIfUrlPresent>
  );
}
