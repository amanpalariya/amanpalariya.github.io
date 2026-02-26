import { Link, Wrap, WrapItem, Text } from "@chakra-ui/react";
import type { CvData } from "data/cv";
import { getRenderableCvSections } from "./cvRenderUtils";
import { getCvSectionPaletteUnsafe } from "./cvPalettes";

export function renderSectionAnchorLinks(sections: CvData["sections"]) {
  return getRenderableCvSections(sections).map((section) => ({
    id: section.id,
    title: section.title,
    accentColorPalette: getCvSectionPaletteUnsafe(section.id),
  }));
}

export default function CvJumpNav({ sections }: { sections: CvData["sections"] }) {
  const links = renderSectionAnchorLinks(sections);
  const separatorColor = "app.fg.subtle";

  if (links.length === 0) return null;

  return (
    <Wrap spacing={3}>
      {links.map((link, index) => (
        <WrapItem key={link.id}>
          <Wrap align="center" spacing={3}>
            <WrapItem>
              <Link
                href={`#${link.id}`}
                fontSize="sm"
                color={`${link.accentColorPalette}.fg`}
                _hover={{
                  color: `${link.accentColorPalette}.emphasized`,
                }}
              >
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