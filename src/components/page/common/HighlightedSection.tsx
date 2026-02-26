import { Button, VStack, HStack, Icon } from "@chakra-ui/react";
import { InnerBgCardWithHeader } from "@components/core/Cards";
import { SectionText } from "../../core/Texts";
import { useColorModeValue } from "@components/ui/color-mode";
import React, { JSX } from "react";
import type { ElementType } from "react";
import NextLink from "next/link";

export default function HighlightedSection({
  title,
  titleIcon,
  titleActionElement,
  background,
  accentColor,
  separateHeader = false,
  children,
}: {
  title?: string;
  titleIcon?: ElementType;
  titleActionElement?: JSX.Element;
  background?: string;
  accentColor?: string;
  separateHeader?: boolean;
  children: JSX.Element;
}) {
  const noHeader = !title && !titleActionElement;

  const headerJsx = noHeader ? undefined : (
    <HStack justify={"space-between"} align={"center"}>
      {title ? (
        <HStack gap={2}>
          {titleIcon ? (
            <Icon
              as={titleIcon}
              color={accentColor ?? useColorModeValue("gray.500", "gray.400")}
            />
          ) : null}
          <SectionText>{title}</SectionText>
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
      color={useColorModeValue("gray.500", "gray.500")}
      onClick={onClick}
    >
      {children} <Icon>{React.createElement(icon)}</Icon>
    </Button>
  );
}
