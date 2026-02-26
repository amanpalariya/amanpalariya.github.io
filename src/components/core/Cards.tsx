import { Box, Card } from "@chakra-ui/react";
import type { BoxProps } from "@chakra-ui/react";
import { useColorModeValue } from "@components/ui/color-mode";

export function HeaderCard({ children }) {
  return (
    <Box
      background={useColorModeValue("gray.50", "gray.700")}
      shadow={"lg"}
      borderWidth={0.5}
      borderColor={useColorModeValue("gray.300", "gray.600")}
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
      background={useColorModeValue("white", "gray.800")}
      shadow={"lg"}
      borderWidth={0.5}
      borderColor={useColorModeValue("gray.300", "gray.600")}
      borderRadius={"2xl"}
      px={[2, 4]}
      py={4}
    >
      {children}
    </Box>
  );
}

export function InnerBgCard({ children, bg, background, ...boxProps }: BoxProps) {
  const defaultBg = useColorModeValue("gray.50", "gray.900");
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
  separateHeader = false,
  ...boxProps
}: BoxProps & {
  header?: React.ReactNode;
  children: React.ReactNode;
  colorPalette?: string;
  primaryColorPalette?: string;
  accentColorPalette?: string;
  separateHeader?: boolean;
}) {
  const resolvedPrimaryPalette = primaryColorPalette ?? colorPalette ?? "gray";
  const resolvedAccentPalette = accentColorPalette ?? resolvedPrimaryPalette;
  const cardBgColor = useColorModeValue(
    `${resolvedPrimaryPalette}.50`,
    `${resolvedPrimaryPalette}.950`
  );
  const resolvedBg = background ?? bg ?? cardBgColor;
  const headerBgColor = useColorModeValue(
    `${resolvedPrimaryPalette}.100`,
    `${resolvedPrimaryPalette}.900`
  );
  const resolvedHeaderBg = separateHeader ? headerBgColor : resolvedBg;
  const separatorColor = useColorModeValue(
    `${resolvedAccentPalette}.200`,
    `${resolvedAccentPalette}.700`
  );

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

export function InnerCard({ children }) {
  return (
    <Box
      background={useColorModeValue("white", "gray.700")}
      shadow={"lg"}
      borderWidth={0.5}
      borderColor={useColorModeValue("gray.300", "gray.600")}
      borderRadius={"2xl"}
      p={[3, 4]}
    >
      {children}
    </Box>
  );
}
