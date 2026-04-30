import { Box, Icon, Text, VStack } from "@chakra-ui/react";
import { LuCheck } from "react-icons/lu";
import type { ReactNode } from "react";
import type { CoverTextPosition } from "../types";

export const COVER_TEXT_POSITION_OPTIONS: CoverTextPosition[] = [
  "style_1",
  "style_2",
  "style_3",
  "style_4",
  "style_5",
  "style_6",
];

export const COVER_PREVIEW_TITLE_WIDTH = "76%";
export const COVER_PREVIEW_AUTHOR_WIDTH = "44%";
export const COVER_PREVIEW_TITLE_HEIGHT = "3px";
export const COVER_PREVIEW_AUTHOR_HEIGHT = "2px";
export const COVER_PREVIEW_TITLE_OPACITY = 0.95;
export const COVER_PREVIEW_AUTHOR_OPACITY = 0.55;
export const COVER_GRID_TILE_RATIO = 40 / 56;
export const COVER_BACKGROUND_LABEL_MODE: CoverGridLabelMode = "bottom";
export const SHOW_BACKGROUND_DESCRIPTIONS = false;
export const COVER_SIZE_LABEL_MODE: CoverGridLabelMode = "side";
export const SHOW_SIZE_DESCRIPTIONS = true;

const COVER_GRID_HOVER_BG = "app.status.info.bg" as const;
const COVER_GRID_SELECTED_BORDER_COLOR = "app.epub.button.primary.border" as const;

export type CoverGridLabelMode = "none" | "bottom" | "side";

export const dropdownGridItemInteractionProps = {
  p: 1,
  bg: "transparent",
  cursor: "pointer",
  transition: "background 0.12s ease",
  _highlighted: {
    bg: COVER_GRID_HOVER_BG,
    outline: "1px solid",
    outlineColor: COVER_GRID_SELECTED_BORDER_COLOR,
  },
  _hover: {
    bg: COVER_GRID_HOVER_BG,
    outline: "1px solid",
    outlineColor: COVER_GRID_SELECTED_BORDER_COLOR,
  },
} as const;

export function resolveGridSelectionFrameProps(isSelected: boolean): {
  borderWidth: "3px" | "1px";
  borderColor: string;
  outline: "2px solid" | "none";
  outlineColor: string;
} {
  if (isSelected) {
    return {
      borderWidth: "3px",
      borderColor: COVER_GRID_SELECTED_BORDER_COLOR,
      outline: "2px solid",
      outlineColor: COVER_GRID_SELECTED_BORDER_COLOR,
    };
  }

  return {
    borderWidth: "1px",
    borderColor: "app.epub.border.default",
    outline: "none",
    outlineColor: "transparent",
  };
}

export function renderGridSelectionBadge(isSelected: boolean): ReactNode {
  if (!isSelected) return null;

  return (
    <Box
      position={"absolute"}
      top={1}
      right={1}
      w={"16px"}
      h={"16px"}
      rounded={"full"}
      bg={"app.epub.button.primary.bg"}
      color={"app.epub.button.primary.fg"}
      display={"grid"}
      placeItems={"center"}
      borderWidth={"1px"}
      borderColor={"app.epub.bg.card"}
    >
      <Icon boxSize={2.5}>
        <LuCheck />
      </Icon>
    </Box>
  );
}

export function resolveRatioFrameSize(
  ratio: number,
  containerRatio: number = COVER_GRID_TILE_RATIO,
): {
  width: string;
  height: string;
} {
  const normalizedRatio = Math.max(0.2, Math.min(3, ratio));
  const normalizedContainerRatio = Math.max(0.2, Math.min(3, containerRatio));
  const maxSize = 74;
  if (normalizedRatio >= normalizedContainerRatio) {
    return {
      width: `${maxSize}%`,
      height: `${((maxSize * normalizedContainerRatio) / normalizedRatio).toFixed(2)}%`,
    };
  }
  return {
    width: `${((maxSize * normalizedRatio) / normalizedContainerRatio).toFixed(2)}%`,
    height: `${maxSize}%`,
  };
}

export function resolveMiniRatioSwatchSize(
  ratio: number,
  maxSizePx: number = 14,
): { widthPx: number; heightPx: number } {
  const normalizedRatio = Math.max(0.2, Math.min(3, ratio));
  if (normalizedRatio >= 1) {
    return {
      widthPx: maxSizePx,
      heightPx: Math.max(3, Math.round(maxSizePx / normalizedRatio)),
    };
  }
  return {
    widthPx: Math.max(3, Math.round(maxSizePx * normalizedRatio)),
    heightPx: maxSizePx,
  };
}

export function renderGridOptionMeta({
  labelMode,
  label,
  description,
  showDescription,
}: {
  labelMode: CoverGridLabelMode;
  label: string;
  description?: string;
  showDescription: boolean;
}): ReactNode {
  if (labelMode === "none") return null;

  const descriptionNode =
    showDescription && description ? (
      <Text
        fontFamily={"ui"}
        fontSize={labelMode === "side" ? "xs" : "2xs"}
        lineHeight={"shorter"}
        color={"app.epub.fg.subtle"}
      >
        {description}
      </Text>
    ) : null;

  if (labelMode === "side") {
    return (
      <VStack align={"start"} gap={0.5} minW={0}>
        <Text
          fontFamily={"ui"}
          fontSize={"sm"}
          color={"app.epub.fg.default"}
          lineClamp={1}
        >
          {label}
        </Text>
        {descriptionNode}
      </VStack>
    );
  }

  return (
    <VStack align={"start"} gap={0.5} pt={1} px={0.5}>
      <Text
        fontFamily={"ui"}
        fontSize={"xs"}
        color={"app.epub.fg.default"}
        lineClamp={1}
      >
        {label}
      </Text>
      {descriptionNode}
    </VStack>
  );
}

type CoverTextPreviewLine = {
  top: string;
  left: string;
};

export function resolveCoverTextPreviewLines(style: CoverTextPosition): {
  title: CoverTextPreviewLine;
  author: CoverTextPreviewLine;
} {
  if (style === "style_2") {
    return {
      title: { top: "46%", left: "12%" },
      author: { top: "57%", left: "12%" },
    };
  }

  if (style === "style_3") {
    return {
      title: { top: "46%", left: "20%" },
      author: { top: "57%", left: "44%" },
    };
  }

  if (style === "style_4") {
    return {
      title: { top: "58%", left: "12%" },
      author: { top: "44%", left: "24%" },
    };
  }

  if (style === "style_5") {
    return {
      title: { top: "58%", left: "12%" },
      author: { top: "44%", left: "12%" },
    };
  }

  if (style === "style_6") {
    return {
      title: { top: "74%", left: "12%" },
      author: { top: "86%", left: "24%" },
    };
  }

  return {
    title: { top: "46%", left: "12%" },
    author: { top: "57%", left: "24%" },
  };
}
