"use client";

import { SecondaryActionButton } from "@components/core/Buttons";
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
    <Tooltip content={"Copy link"} hasArrow shouldWrapChildren closeOnScroll>
      <SecondaryActionButton
        icon={clicked ? FiCheck : FiLink}
        onClick={changeIconAndCopy}
      >
        Copy link
      </SecondaryActionButton>
    </Tooltip>
  );
}
