import { Button, VStack, HStack, Icon, Link } from "@chakra-ui/react";
import { InnerBgCard } from "../../core/Cards";
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
  children,
}: {
  title?: string;
  titleIcon?: ElementType;
  titleActionElement?: JSX.Element;
  background?: string;
  accentColor?: string;
  children: JSX.Element;
}) {
  const noHeader = !title && !titleActionElement;

  return (
    <InnerBgCard background={background}>
      <VStack align={"stretch"} gap={4}>
        {noHeader ? null : (
          <HStack justify={"space-between"}>
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
        )}
        {children}
      </VStack>
    </InnerBgCard>
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
      color={useColorModeValue("gray.500", "gray.500")}
      onClick={onClick}
    >
      {children} <Icon>{React.createElement(icon)}</Icon>
    </Button>
  );
}
