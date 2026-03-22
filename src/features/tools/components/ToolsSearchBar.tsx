"use client";

import { Button, HStack, Input } from "@chakra-ui/react";

export function ToolsSearchBar({
  value,
  placeholder,
  onChange,
  onClear,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <HStack gap={2} align={"stretch"}>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        background={"app.bg.card"}
      />
      <Button
        variant={"surface"}
        borderRadius={"lg"}
        onClick={onClear}
        disabled={!value}
      >
        Clear
      </Button>
    </HStack>
  );
}
