"use client";

import { Clipboard, HStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FiCheck, FiLink } from "react-icons/fi";
import { Tooltip } from "@components/ui/tooltip";

export default function CopyLinkSecondaryButton({
  iconOnly = false,
}: {
  iconOnly?: boolean;
}) {
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  return (
    <Tooltip
      content={"Copy link"}
      showArrow
      closeOnScroll
      positioning={{ placement: "bottom" }}
    >
      <span>
        <Clipboard.Root value={currentUrl} timeout={1000}>
          <Clipboard.Trigger asChild>
            <HStack
              as="button"
              type="button"
              gap={iconOnly ? 0 : 2}
              fontFamily="ui"
              fontSize="sm"
              color="app.fg.subtle"
              cursor="pointer"
              px={iconOnly ? 2 : 3}
              py={iconOnly ? 2 : 1.5}
              rounded="full"
              borderWidth="1px"
              borderColor="app.border.default"
              bg="app.bg.default"
              transition="all 0.16s ease"
              minH={iconOnly ? 8 : 10}
              minW={iconOnly ? 8 : 10}
              _hover={{
                color: "app.fg.default",
                borderColor: "app.fg.icon",
                bg: "app.bg.subtle",
                transform: "translateY(-1px)",
              }}
            >
              <Clipboard.Indicator copied={<FiCheck />}>
                <FiLink />
              </Clipboard.Indicator>
              {iconOnly ? null : (
                <Clipboard.Indicator copied={"Copied"}>
                  {"Copy link"}
                </Clipboard.Indicator>
              )}
            </HStack>
          </Clipboard.Trigger>
        </Clipboard.Root>
      </span>
    </Tooltip>
  );
}
