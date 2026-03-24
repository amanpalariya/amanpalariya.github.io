import { Box } from "@chakra-ui/react";

export const APP_LIST_DIVIDER_WIDTH = "2px" as const;
export const APP_LIST_DIVIDER_COLOR = "app.border.muted" as const;

export function ListDivider() {
  return <Box h={APP_LIST_DIVIDER_WIDTH} bg={APP_LIST_DIVIDER_COLOR} />;
}
