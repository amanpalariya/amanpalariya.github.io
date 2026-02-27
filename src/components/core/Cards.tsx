import { Box } from "@chakra-ui/react";
import type { BoxProps } from "@chakra-ui/react";

export function HeaderCard({ children }) {
  return (
    <Box
      background={"app.bg.cardHeader"}
      shadow={"sm"}
      borderWidth={0}
      borderColor={"app.border.default"}
      borderRadius={"2xl"}
      px={4}
      py={4}
    >
      {children}
    </Box>
  );
}

export function MainCard({ children }) {
  return (
    <Box
      background={"app.bg.card"}
      borderWidth={0}
      borderColor={"app.border.default"}
      borderRadius={"2xl"}
      px={[2, 4]}
      py={4}
    >
      {children}
    </Box>
  );
}

export function InnerBgCard({
  children,
  bg,
  background,
  ...boxProps
}: BoxProps) {
  const defaultBg = "app.bg.surface";
  const resolvedBg = background ?? bg ?? defaultBg;

  return (
    <Box
      background={resolvedBg}
      shadow={"xs"}
      borderRadius={"2xl"}
      p={[4, 6]}
      {...boxProps}
    >
      {children}
    </Box>
  );
}

export function InnerBgCardWithHeader({
  header,
  children,
  bg,
  background,
  colorPalette,
  primaryColorPalette,
  accentColorPalette,
  useAccentForHeader = false,
  separateHeader = false,
  ...boxProps
}: BoxProps & {
  header?: React.ReactNode;
  children: React.ReactNode;
  colorPalette?: string;
  primaryColorPalette?: string;
  accentColorPalette?: string;
  useAccentForHeader?: boolean;
  separateHeader?: boolean;
}) {
  const resolvedPrimaryPalette = primaryColorPalette ?? colorPalette ?? "gray";
  const resolvedAccentPalette = accentColorPalette ?? resolvedPrimaryPalette;
  const resolvedHeaderPalette = useAccentForHeader
    ? resolvedAccentPalette
    : resolvedPrimaryPalette;
  const cardBgColor = `${resolvedPrimaryPalette}.subtle`;
  const resolvedBg = background ?? bg ?? cardBgColor;
  const headerBgColor = `${resolvedHeaderPalette}.muted`;
  const resolvedHeaderBg = separateHeader ? headerBgColor : resolvedBg;
  const separatorColor = `${resolvedAccentPalette}.emphasized`;

  return (
    <Box
      background={resolvedBg}
      shadow={"xs"}
      borderRadius={"2xl"}
      overflow={"hidden"}
      {...boxProps}
    >
      {header ? (
        <Box
          px={[4, 6]}
          py={4}
          background={resolvedHeaderBg}
          borderBottomWidth={separateHeader ? "2px" : "0px"}
          borderBottomColor={separatorColor}
        >
          {header}
        </Box>
      ) : null}

      <Box px={[4, 6]} py={2}>
        {children}
      </Box>
    </Box>
  );
}
