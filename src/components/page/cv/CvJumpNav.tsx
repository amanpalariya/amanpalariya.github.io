import { Link, Wrap, WrapItem } from "@chakra-ui/react";
import type { CvData } from "data/cv";
import { useColorModeValue } from "@components/ui/color-mode";

export function renderSectionAnchorLinks(sections: CvData["sections"]) {
  return Object.values(sections)
    .filter(Boolean)
    .map((section) => ({
      id: section.id,
      title: section.title,
    }));
}

export default function CvJumpNav({ sections }: { sections: CvData["sections"] }) {
  const links = renderSectionAnchorLinks(sections);
  const linkColor = useColorModeValue("blue.600", "blue.300");

  if (links.length === 0) return null;

  return (
    <Wrap spacing={3}>
      {links.map((link) => (
        <WrapItem key={link.id}>
          <Link href={`#${link.id}`} fontSize="sm" color={linkColor}>
            {link.title}
          </Link>
        </WrapItem>
      ))}
    </Wrap>
  );
}