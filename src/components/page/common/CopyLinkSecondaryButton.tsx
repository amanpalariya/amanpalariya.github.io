"use client";

import { HStack, Icon } from "@chakra-ui/react";
import { useState } from "react";
import { FiCheck, FiLink } from "react-icons/fi";
import { Tooltip } from "@components/ui/tooltip";

export default function CopyLinkSecondaryButton() {
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
        gap={2}
        onClick={changeIconAndCopy}
        fontSize="sm"
        color="gray.500"
        cursor="pointer"
        _hover={{ color: "gray.700" }}
      >
        <Icon boxSize={4}>{clicked ? <FiCheck /> : <FiLink />}</Icon>
        <span>{"Copy link"}</span>
      </HStack>
    </Tooltip>
  );
}
