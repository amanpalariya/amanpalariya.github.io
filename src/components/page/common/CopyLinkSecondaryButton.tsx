"use client";

import { HStack, Icon } from "@chakra-ui/react";
import { useState } from "react";
import { FiCheck, FiLink } from "react-icons/fi";
import { Tooltip } from "@components/ui/tooltip";

export default function CopyLinkSecondaryButton({
  iconOnly = false,
}: {
  iconOnly?: boolean;
}) {
  const [clicked, setClicked] = useState(false);

  function changeIconAndCopy() {
    if (clicked) return;
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setClicked(true);
      setTimeout(() => setClicked(false), 1000);
    }
  }

  return (
    <Tooltip content={"Copy link"} showArrow closeOnScroll>
      <HStack
        as="button"
        gap={iconOnly ? 0 : 2}
        onClick={changeIconAndCopy}
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
        <Icon boxSize={4}>{clicked ? <FiCheck /> : <FiLink />}</Icon>
        {iconOnly ? null : <span>{"Copy link"}</span>}
      </HStack>
    </Tooltip>
  );
}
