"use client";

import { CloseButton, Popover, Portal } from "@chakra-ui/react";

export default function ReviewPopover({
  title,
  review,
}: {
  title: string;
  review: string;
}) {
  return (
    <Popover.Root
      size="sm"
      lazyMount
      unmountOnExit
      positioning={{ placement: "bottom-start", strategy: "fixed", gutter: 6 }}
    >
      <Popover.Trigger
        aria-label={`My review of ${title}`}
        color="app.fg.link"
        cursor="pointer"
        fontSize="13px"
        lineHeight="24px"
        mt={1}
        _hover={{ textDecoration: "underline" }}
      >
        My review
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content
            aria-label={title}
            bg="app.bg.canvas"
            borderWidth="1px"
            borderColor="app.border.default"
            width="min(300px, calc(100dvw - 24px))"
            overflowY="auto"
            _open={{ animation: "none" }}
            _closed={{ animation: "none" }}
          >
            <Popover.Body>
              <Popover.Title color="app.prose.heading" fontWeight="bold" pr={7}>
                {title}
              </Popover.Title>
              <Popover.Description
                mt={1}
                color="app.prose.body"
                overflowWrap="anywhere"
              >
                {review}
              </Popover.Description>
            </Popover.Body>
            <Popover.CloseTrigger asChild>
              <CloseButton
                aria-label="Close review"
                size="xs"
                position="absolute"
                top={2}
                insetEnd={2}
              />
            </Popover.CloseTrigger>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
