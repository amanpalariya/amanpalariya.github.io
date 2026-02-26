import { Button, VStack, HStack, Icon } from "@chakra-ui/react";
import { InnerBgCardWithHeader } from "@components/core/Cards";
import { SectionText } from "../../core/Texts";
import React, { JSX } from "react";
import type { ElementType } from "react";
import NextLink from "next/link";

export default function HighlightedSection({
  title,
  titleIcon,
  titleActionElement,
  background,
  accentColor,
  primaryColorPalette,
  accentColorPalette,
  separateHeader = false,
  children,
}: {
  title?: string;
  titleIcon?: ElementType;
  titleActionElement?: JSX.Element;
  background?: string;
  accentColor?: string;
  primaryColorPalette?: string;
  accentColorPalette?: string;
  separateHeader?: boolean;
  children: JSX.Element;
}) {
  const resolvedPrimaryPalette = primaryColorPalette ?? accentColor ?? "gray";
  const resolvedAccentPalette =
    accentColorPalette ?? accentColor ?? resolvedPrimaryPalette;
  const noHeader = !title && !titleActionElement;

  const headerJsx = noHeader ? undefined : (
    <HStack justify={"space-between"} align={"center"}>
      {title ? (
        <HStack gap={2}>
          {titleIcon ? (
            <Icon as={titleIcon} color={`${resolvedAccentPalette}.focusRing`} />
          ) : null}
          <SectionText
            dotColorPalette={resolvedAccentPalette}
            hideDot={Boolean(titleIcon)}
          >
            {title}
          </SectionText>
        </HStack>
      ) : (
        <div />
      )}
      {titleActionElement}
    </HStack>
  );

  return (
    <InnerBgCardWithHeader
      header={headerJsx}
      separateHeader={separateHeader}
      background={background}
      primaryColorPalette={resolvedPrimaryPalette}
      accentColorPalette={resolvedAccentPalette}
    >
      <VStack align={"stretch"} gap={4}>
        {children}
      </VStack>
    </InnerBgCardWithHeader>
  );
}

export function SectionActionLink({
  children,
  icon,
  onClick,
  url,
}: {
  children: string;
  icon?: any;
  onClick?: () => any;
  url?: string;
}) {
  return (
    <Button
      as={NextLink}
      href={url ?? ""}
      variant={"ghost"}
      h={"auto"}
      color={"app.fg.subtle"}
      onClick={onClick}
    >
      {children} <Icon>{React.createElement(icon)}</Icon>
    </Button>
  );
}
