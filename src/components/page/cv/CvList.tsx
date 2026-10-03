import { Box, VStack } from "@chakra-ui/react";
import { Children, type ReactNode } from "react";
import { CV_LIST_DIVIDER_BORDER } from "./cvStyleTokens";

// Lists own dashed borders before each row; CvSection owns solid section boundaries.
export default function CvList({
  children,
  insetStart = false,
}: {
  children: ReactNode;
  insetStart?: boolean;
}) {
  return (
    <VStack align="stretch" gap={0} ml={insetStart ? 0 : -4} mr={-4}>
      {Children.toArray(children).map((child, index) => (
        <Box
          key={index}
          borderTop={CV_LIST_DIVIDER_BORDER}
          ml={insetStart && index === 0 ? -4 : 0}
          pl={insetStart && index > 0 ? 0 : 4}
          pr={4}
          py={4}
          _last={{ pb: 0 }}
        >
          {child}
        </Box>
      ))}
    </VStack>
  );
}
