import {
  HStack,
  VStack,
  Icon,
  Box,
  LinkBox,
  LinkOverlay,
  Text,
  Wrap,
  WrapItem,
  Separator,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { Children, Fragment, type ReactNode } from "react";
import { FiChevronRight, FiArrowUpRight } from "react-icons/fi";
import { CategoryBadge } from "./Badges";
import { Switch } from "@components/ui/switch";

type SwitchCheckedChangeDetails = {
  checked: boolean;
};

function useTileColors() {
  return {
    description: "app.prose.body",
    linkIcon: "app.fg.icon",
  };
}

export function TileBody({
  children,
  compact = false,
}: {
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <Box className="tile-body" px={0} py={compact ? [2, 2] : [2, 3]}>
      {children}
    </Box>
  );
}

/** A page list whose padded rows and separators reach the main column edges. */
export function FeedList({ children }: { children: ReactNode }) {
  return (
    <TileList feed showDividerBeforeFirst showDividerAfterLast>
      {children}
    </TileList>
  );
}

export function TileList({
  children,
  showDividerBeforeFirst = false,
  showDividerAfterLast = false,
  feed = false,
}: {
  children: React.ReactNode;
  showDividerBeforeFirst?: boolean;
  showDividerAfterLast?: boolean;
  feed?: boolean;
}) {
  const items = Children.toArray(children).filter(Boolean);

  return (
    <VStack
      align={"stretch"}
      gap={0}
      mx={feed ? -4 : undefined}
      css={
        feed
          ? {
              "& .tile-body": { padding: "16px" },
              "& .chakra-linkbox:hover": {
                background: "var(--site-nav-selected)",
              },
            }
          : undefined
      }
    >
      {showDividerBeforeFirst ? (
        <Separator
          size={feed ? "sm" : "md"}
          borderColor={feed ? "var(--site-line)" : undefined}
        />
      ) : null}
      {items.map((child, index) => (
        <Fragment key={index}>
          {child}
          {index < items.length - 1 ? (
            <Separator
              size={feed ? "sm" : "md"}
              borderColor={feed ? "var(--site-line)" : undefined}
            />
          ) : null}
        </Fragment>
      ))}
      {showDividerAfterLast ? (
        <Separator
          size={feed ? "sm" : "md"}
          borderColor={feed ? "var(--site-line)" : undefined}
        />
      ) : null}
    </VStack>
  );
}

function TileLinkIfUrlPresent({
  children,
  url,
  label,
  isUrlExternal,
}: {
  children: ReactNode;
  url?: string;
  label: string;
  isUrlExternal?: boolean;
}) {
  if (!url) return <>{children}</>;

  const overlay = isUrlExternal ? (
    <LinkOverlay
      aria-label={label}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    />
  ) : (
    <LinkOverlay as={NextLink} aria-label={label} href={url} />
  );

  return (
    <LinkBox>
      {children}
      {overlay}
    </LinkBox>
  );
}

function LinkHelperIcon({ isExternal }: { isExternal: boolean }) {
  const { linkIcon } = useTileColors();

  return (
    <Icon color={linkIcon} boxSize={5}>
      {isExternal ? <FiArrowUpRight /> : <FiChevronRight />}
    </Icon>
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
      <Text as="span" fontSize={"sm"}>
        <time dateTime={publishedDate.toISOString()}>{publishedLabel}</time>
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
      <time dateTime={publishedDate.toISOString()}>{publishedLabel}</time>
      {" · Updated "}
      <time dateTime={updatedDate.toISOString()}>{updatedLabel}</time>
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

  const descriptionJsx = (
    <Text fontSize="15px" lineHeight="1.5" color={descriptionColor}>
      {description}
    </Text>
  );

  return (
    <TileLinkIfUrlPresent url={url} label={title} isUrlExternal={isUrlExternal}>
      <TileBody>
        <VStack align={"stretch"}>
          <HStack justify={"space-between"} align={"start"}>
            <VStack align={"start"} gap={1}>
              <Text fontSize="16px" fontWeight={700} color={"app.fg.default"}>
                {title}
              </Text>
              {descriptionJsx}
            </VStack>
            {url ? <LinkHelperIcon isExternal={isUrlExternal} /> : null}
          </HStack>
        </VStack>
      </TileBody>
    </TileLinkIfUrlPresent>
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
  const metadataColor = "app.prose.subtle";

  const descriptionJsx = (
    <Text fontSize="15px" lineHeight="1.5" color={descriptionColor}>
      {description}
    </Text>
  );
  const metadataLabel = formatBlogDateLabel({ published, updated });

  return (
    <TileLinkIfUrlPresent url={url} label={title} isUrlExternal={isUrlExternal}>
      <TileBody>
        <VStack align={"stretch"} gap={2}>
          <HStack justify={"space-between"} align={"start"}>
            <VStack align={"start"} gap={0}>
              <Text fontSize="16px" fontWeight={700} color={"app.fg.default"}>
                {title}
              </Text>
              {descriptionJsx}
            </VStack>
            {url ? <LinkHelperIcon isExternal={isUrlExternal} /> : null}
          </HStack>

          {metadataLabel ? (
            <Text color={metadataColor}>{metadataLabel}</Text>
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
      </TileBody>
    </TileLinkIfUrlPresent>
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

  const descriptionJsx = (
    <Text fontSize="15px" lineHeight="1.5" color={descriptionColor}>
      {description}
    </Text>
  );

  return (
    <TileLinkIfUrlPresent url={url} label={title} isUrlExternal={isUrlExternal}>
      <TileBody>
        <VStack align={"stretch"}>
          <HStack justify="space-between" align="start" gap={4}>
            <VStack align="start" gap={1} minW={0}>
              <Text fontSize="16px" fontWeight={700} color={"app.fg.default"}>
                {title}
              </Text>
              {descriptionJsx}
            </VStack>
            <Switch
              checked={toggleValue}
              onCheckedChange={(details: SwitchCheckedChangeDetails) =>
                onToggle?.(details.checked)
              }
              colorPalette="blue"
              flexShrink={0}
              inputProps={{ "aria-label": title }}
            />
          </HStack>
        </VStack>
      </TileBody>
    </TileLinkIfUrlPresent>
  );
}
