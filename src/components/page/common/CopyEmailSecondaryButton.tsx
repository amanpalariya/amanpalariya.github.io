"use client";

import { Button, Icon } from "@chakra-ui/react";
import { Clipboard } from "@components/ui/clipboard";
import { trackEvent } from "@utils/analytics";
import { PersonalData } from "data";
import { FiCheck, FiCopy } from "react-icons/fi";
import { Tooltip } from "@components/ui/tooltip";

export default function CopyEmailButton() {
  return (
    <Tooltip
      content={PersonalData.email}
      showArrow
      closeOnScroll
    >
      <span>
        <Clipboard.Root
          value={PersonalData.email}
          timeout={1000}
          onStatusChange={({ copied }) => {
            if (copied) trackEvent("copy_email");
          }}
        >
          <Clipboard.Trigger asChild>
            <Button
              fontFamily="ui"
              fontSize="sm"
              px={2.5}
              shadow="none"
              rounded="full"
              variant="outline"
              background="transparent"
              aria-label="Copy Email"
            >
              <Clipboard.Indicator copied={<Icon as={FiCheck} />}>
                <Icon as={FiCopy} />
              </Clipboard.Indicator>
              <Clipboard.Indicator copied={"Copied"}>
                Copy Email
              </Clipboard.Indicator>
            </Button>
          </Clipboard.Trigger>
        </Clipboard.Root>
      </span>
    </Tooltip>
  );
}
