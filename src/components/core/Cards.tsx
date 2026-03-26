import { Box } from "@chakra-ui/react";
import type { BoxProps } from "@chakra-ui/react";

export function HeaderCard({ children }) {
  return (
    <Box
      background={"app.bg.cardHeader"}
      backgroundImage={
        "radial-gradient(circle at 20% 25%, rgba(56, 189, 248, 0.12) 0 2px, transparent 2px), radial-gradient(circle at 80% 70%, rgba(244, 114, 182, 0.1) 0 1.5px, transparent 1.5px), radial-gradient(circle at 45% 80%, rgba(34, 197, 94, 0.1) 0 1px, transparent 1px)"
      }
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
      backgroundImage={
        "radial-gradient(circle at 12% 18%, rgba(56, 189, 248, 0.08) 0 1.5px, transparent 1.5px), radial-gradient(circle at 88% 74%, rgba(251, 113, 133, 0.08) 0 1.5px, transparent 1.5px), radial-gradient(circle at 52% 62%, rgba(16, 185, 129, 0.08) 0 1px, transparent 1px)"
      }
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
  contentPx = [4, 6],
  contentPy = 2,
  ...boxProps
}: BoxProps & {
  header?: React.ReactNode;
  children: React.ReactNode;
  colorPalette?: string;
  primaryColorPalette?: string;
  accentColorPalette?: string;
  useAccentForHeader?: boolean;
  separateHeader?: boolean;
  contentPx?: BoxProps["px"];
  contentPy?: BoxProps["py"];
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
          py={3}
          background={resolvedHeaderBg}
          borderBottomWidth={separateHeader ? "2px" : "0px"}
          borderBottomColor={separatorColor}
        >
          {header}
        </Box>
      ) : null}

      <Box px={contentPx} py={contentPy}>
        {children}
      </Box>
    </Box>
  );
}
