import { Link, Wrap, WrapItem, Text } from "@chakra-ui/react";
import type { CvData } from "data/cv";
import { useColorModeValue } from "@components/ui/color-mode";
import { getRenderableCvSections } from "./cvRenderUtils";

export function renderSectionAnchorLinks(sections: CvData["sections"]) {
  return getRenderableCvSections(sections).map((section) => ({
    id: section.id,
    title: section.title,
  }));
}

export default function CvJumpNav({ sections }: { sections: CvData["sections"] }) {
  const links = renderSectionAnchorLinks(sections);
  const linkColor = useColorModeValue("blue.600", "blue.300");
  const separatorColor = useColorModeValue("gray.500", "gray.400");

  if (links.length === 0) return null;

  return (
    <Wrap spacing={3}>
      {links.map((link, index) => (
        <WrapItem key={link.id}>
          <Wrap align="center" spacing={3}>
            <WrapItem>
              <Link href={`#${link.id}`} fontSize="sm" color={linkColor}>
                {link.title}
              </Link>
            </WrapItem>
            {index < links.length - 1 ? (
              <WrapItem>
                <Text fontSize="sm" color={separatorColor} aria-hidden="true">
                  •
                </Text>
              </WrapItem>
            ) : null}
          </Wrap>
        </WrapItem>
      ))}
    </Wrap>
  );
}