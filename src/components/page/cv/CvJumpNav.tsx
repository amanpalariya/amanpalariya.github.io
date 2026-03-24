import { Link, Wrap, WrapItem, Text } from "@chakra-ui/react";
import type { CvData } from "data/cv";
import { getRenderableCvSections } from "./cvRenderUtils";
import { getCvSectionPaletteUnsafe } from "./cvPalettes";
import { CV_CMU_FONT_FAMILY, CV_META_TEXT_SIZE } from "./cvStyleTokens";

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
    <Wrap gap={3}>
      {links.map((link, index) => (
        <WrapItem key={link.id}>
          <Wrap align="center" gap={3}>
            <WrapItem>
              <Link
                href={`#${link.id}`}
                fontFamily={CV_CMU_FONT_FAMILY}
                fontSize={CV_META_TEXT_SIZE}
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
                <Text
                  fontSize={CV_META_TEXT_SIZE}
                  color={separatorColor}
                  fontFamily={CV_CMU_FONT_FAMILY}
                  aria-hidden="true"
                >
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
