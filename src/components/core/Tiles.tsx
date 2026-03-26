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
import { Avatar } from "@components/ui/avatar";
import { Switch } from "@components/ui/switch";
import {
  APP_LIST_DIVIDER_COLOR,
  APP_LIST_DIVIDER_WIDTH,
} from "@components/core/Dividers";

function useTileColors() {
  return {
    divider: APP_LIST_DIVIDER_COLOR,
    description: "app.fg.subtle",
    avatarBorder: "app.border.default",
    linkIcon: "app.fg.icon",
  };
}

function FlatTile({
  children,
  compact = false,
}: {
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <Box px={[1, 2]} py={compact ? [2, 2] : [2, 3]}>
      {children}
    </Box>
  );
}

export function TileList({
  children,
  showDividerBeforeFirst = false,
  showDividerAfterLast = false,
}: {
  children: React.ReactNode;
  showDividerBeforeFirst?: boolean;
  showDividerAfterLast?: boolean;
}) {
  const items = Children.toArray(children).filter(Boolean);
  const { divider: dividerColor } = useTileColors();

  return (
    <VStack
      align={"stretch"}
      gap={0}
      borderTopWidth={showDividerBeforeFirst ? APP_LIST_DIVIDER_WIDTH : "0px"}
      borderTopColor={dividerColor}
      borderBottomWidth={showDividerAfterLast ? APP_LIST_DIVIDER_WIDTH : "0px"}
      borderBottomColor={dividerColor}
    >
      {items.map((child, index) => (
        <Box
          key={index}
          borderBottomWidth={
            index < items.length - 1 ? APP_LIST_DIVIDER_WIDTH : "0px"
          }
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
        rel="noopener noreferrer"
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
  const { linkIcon } = useTileColors();

  return (
    <Icon color={linkIcon} boxSize={5}>
      {isExternal ? <FiArrowUpRight /> : <FiChevronRight />}
    </Icon>
  );
}

export function TitleDescriptionAvatarTile({
  title,
  description,
  avatarSrc,
  url,
  compact = false,
  isUrlExternal = false,
}: {
  title: string;
  description: string;
  avatarSrc?: string;
  url?: string;
  compact?: boolean;
  isUrlExternal?: boolean;
}) {
  const showDescriptionBelow = useBreakpointValue([true, false]);
  const { description: descriptionColor, avatarBorder } = useTileColors();

  const descriptionJsx = <Text color={descriptionColor}>{description}</Text>;

  return (
    <LinkOverlayIfUrlPresent url={url} isUrlExternal={isUrlExternal}>
      <FlatTile compact={compact}>
        <VStack align={"stretch"} gap={compact ? 2 : 2}>
          <HStack justify={"space-between"}>
            <HStack gap={compact ? 4 : 4}>
              <Box
                rounded={"full"}
                p={compact ? 1.5 : 1.5}
                borderWidth={"medium"}
                borderColor={avatarBorder}
              >
                <Avatar size={"md"} name={title} src={avatarSrc} />
              </Box>
              <VStack align={"start"} gap={compact ? 1 : 1}>
                <Text fontSize={"lg"} fontWeight="medium" color={"app.fg.default"}>
                  {title}
                </Text>
                {showDescriptionBelow ? null : descriptionJsx}
              </VStack>
            </HStack>
            {url ? <LinkHelperIcon isExternal={isUrlExternal} /> : null}
          </HStack>
          <Box mx={compact ? 1 : 2}>{showDescriptionBelow ? descriptionJsx : null}</Box>
        </VStack>
      </FlatTile>
    </LinkOverlayIfUrlPresent>
  );
}

function parseBlogDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatBlogDateLabel({
  published,
  updated,
}: {
  published?: string;
  updated?: string;
}) {
  const publishedDate = parseBlogDate(published);
  if (!publishedDate) return null;

  const publishedLabel = publishedDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const updatedDate = parseBlogDate(updated);
  if (!updatedDate) {
    return (
      <Text as="time" dateTime={publishedDate.toISOString()} fontSize={"sm"}>
        {publishedLabel}
      </Text>
    );
  }

  const updatedLabel = updatedDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Text as="span" fontSize={"sm"}>
      <Text as="time" dateTime={publishedDate.toISOString()}>
        {publishedLabel}
      </Text>
      {" · Updated "}
      <Text as="time" dateTime={updatedDate.toISOString()}>
        {updatedLabel}
      </Text>
    </Text>
  );
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
  const { description: descriptionColor } = useTileColors();

  const descriptionJsx = <Text color={descriptionColor}>{description}</Text>;

  return (
    <LinkOverlayIfUrlPresent url={url} isUrlExternal={isUrlExternal}>
      <FlatTile>
        <VStack align={"stretch"}>
          <HStack justify={"space-between"} align={"start"}>
            <VStack align={"start"} gap={1}>
              <Text fontSize={"lg"} fontWeight="medium" color={"app.fg.default"}>
                {title}
              </Text>
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
  const { description: descriptionColor } = useTileColors();
  const metadataColor = descriptionColor;

  const descriptionJsx = <Text color={descriptionColor}>{description}</Text>;
  const metadataLabel = formatBlogDateLabel({ published, updated });

  return (
    <LinkOverlayIfUrlPresent url={url} isUrlExternal={isUrlExternal}>
      <FlatTile>
        <VStack align={"stretch"} gap={2}>
          <HStack justify={"space-between"} align={"start"}>
            <VStack align={"start"} gap={0}>
              <Text fontSize={"lg"} fontWeight="medium" color={"app.fg.default"}>
                {title}
              </Text>
              {descriptionJsx}
            </VStack>
            {url ? <LinkHelperIcon isExternal={isUrlExternal} /> : null}
          </HStack>

          {metadataLabel ? (
            <Text color={metadataColor}>
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
  const { avatarBorder } = useTileColors();

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
                borderColor={avatarBorder}
              >
                <Avatar size={"sm"} name={title} src={avatarSrc} />
              </Box>
              <VStack align={"start"}>
                <Text fontSize={"lg"} fontWeight="medium" color={"app.fg.default"}>
                  {title}
                </Text>
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
  const { description: descriptionColor } = useTileColors();

  const descriptionJsx = <Text color={descriptionColor}>{description}</Text>;

  return (
    <LinkOverlayIfUrlPresent url={url} isUrlExternal={isUrlExternal}>
      <FlatTile>
        <VStack align={"stretch"}>
          <HStack justify={"space-between"}>
            <VStack align={"start"}>
              <Text fontSize={"lg"} fontWeight="medium" color={"app.fg.default"}>
                {title}
              </Text>
              {descriptionJsx}
            </VStack>
            <Switch
              checked={toggleValue}
              onCheckedChange={(details) => onToggle?.(details.checked)}
              inputProps={{ "aria-label": title }}
            />
          </HStack>
        </VStack>
      </FlatTile>
    </LinkOverlayIfUrlPresent>
  );
}
