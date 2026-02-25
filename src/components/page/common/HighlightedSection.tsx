import { Button, VStack, HStack, Icon, Box } from "@chakra-ui/react";
import { InnerBgCardWithHeader } from "@components/core/Cards";
import { SectionText } from "../../core/Texts";
import { useColorModeValue } from "@components/ui/color-mode";
import React, { JSX } from "react";
import NextLink from "next/link";

export default function HighlightedSection({
  title,
  titleActionElement,
  separateHeader = false,
  children,
}: {
  title?: string;
  titleActionElement?: JSX.Element;
  separateHeader?: boolean;
  children: JSX.Element;
}) {
  const noHeader = !title && !titleActionElement;

  const headerJsx = noHeader ? undefined : (
    <HStack justify={"space-between"} align={"center"}>
      {title ? <SectionText>{title}</SectionText> : <div />}
      {titleActionElement}
    </HStack>
  );

  return (
    <InnerBgCardWithHeader header={headerJsx} separateHeader={separateHeader}>
      {children}
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
