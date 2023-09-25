import {
  VStack,
  HStack,
  useColorModeValue,
  Icon,
  Button,
} from "@chakra-ui/react";
import { InnerBgCard } from "../../core/Cards";
import { SectionText } from "../../core/Texts";
import { Link } from "@chakra-ui/next-js";

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
      <VStack align={"stretch"} spacing={4}>
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
    <Link href={url ?? ""}>
      <Button
        variant={"link"}
        color={useColorModeValue("gray.500", "gray.500")}
        rightIcon={icon ? <Icon as={icon} /> : undefined}
        onClick={onClick}
      >
        {children}
      </Button>
    </Link>
  );
}
