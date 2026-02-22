import { SecondaryActionButton } from "@components/core/Buttons";
import { PersonalData } from "data";
import { useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";
import { Tooltip } from "@components/ui/tooltip";

export default function CopyEmailButton() {
  const [clicked, setClicked] = useState(false);

  function changeIconAndCopy() {
    if (clicked) return;
    navigator.clipboard.writeText(PersonalData.email);
    setClicked(true);
    setTimeout(() => setClicked(false), 1000);
  }

  return (
    <Tooltip
      content={PersonalData.email}
      showArrow
      closeOnScroll
    >
      <span>
        <SecondaryActionButton
          icon={clicked ? FiCheck : FiCopy}
          onClick={changeIconAndCopy}
        >
          Copy Email
        </SecondaryActionButton>
      </span>
    </Tooltip>
  );
}
