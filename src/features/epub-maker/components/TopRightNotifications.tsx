import { Alert, Box, CloseButton, VStack } from "@chakra-ui/react";
import type { UiNotification } from "../types";

export function TopRightNotifications({
  notifications,
  onDismiss,
}: {
  notifications: UiNotification[];
  onDismiss: (id: string) => void;
}) {
  if (notifications.length === 0) return null;

  return (
    <Box
      position={"fixed"}
      top={4}
      right={4}
      zIndex={2000}
      w={["calc(100vw - 2rem)", "360px"]}
      pointerEvents={"none"}
    >
      <VStack align={"stretch"} gap={2}>
        {notifications.map((notification) => (
          <Alert.Root
            key={notification.id}
            status={notification.type}
            pointerEvents={"auto"}
            boxShadow={"md"}
            rounded={"xl"}
          >
            <Alert.Indicator />
            <Alert.Content>
              <Box display={"flex"} justifyContent={"space-between"} alignItems={"start"}>
                <Box>
                  <Alert.Title>{notification.title}</Alert.Title>
                  {notification.description ? (
                    <Alert.Description>{notification.description}</Alert.Description>
                  ) : null}
                </Box>
                <CloseButton size={"sm"} onClick={() => onDismiss(notification.id)} />
              </Box>
            </Alert.Content>
          </Alert.Root>
        ))}
      </VStack>
    </Box>
  );
}
