import { Box, Card } from "@chakra-ui/react";
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

export function InnerBgCard({ children }) {
  return (
    <Box
      background={useColorModeValue("gray.50", "gray.900")}
      shadow={"xs"}
      borderRadius={"2xl"}
      p={[4, 6]}
    >
      {children}
    </Box>
  );
}

export function InnerBgCardWithHeader({
  header,
  children,
  separateHeader = false,
}: {
  header?: React.ReactNode;
  children: React.ReactNode;
  separateHeader?: boolean;
}) {
  const cardBgColor = useColorModeValue("gray.50", "gray.950");
  const headerBgColor = useColorModeValue("gray.100", "gray.900");
  const separatorColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box
      background={cardBgColor}
      shadow={"xs"}
      borderRadius={"2xl"}
      overflow={"hidden"}
    >
      {header ? (
        <Box
          px={[4, 6]}
          py={4}
          background={headerBgColor}
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
