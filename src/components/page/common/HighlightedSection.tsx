import { Button, VStack, HStack, Icon, Link } from "@chakra-ui/react";
import { InnerBgCard } from "../../core/Cards";
import { SectionText } from "../../core/Texts";
import { useColorModeValue } from "@components/ui/color-mode";
import React, { JSX } from "react";
import NextLink from "next/link";

export default function HighlightedSection({
  title,
  titleActionElement,
  children,
}: {
  title?: string;
  titleActionElement?: JSX.Element;
  children: JSX.Element;
}) {
  const noHeader = !title && !titleActionElement;

  return (
    <InnerBgCard>
      <VStack align={"stretch"} gap={4}>
        {noHeader ? null : (
          <HStack justify={"space-between"}>
            {title ? <SectionText>{title}</SectionText> : <div />}
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
