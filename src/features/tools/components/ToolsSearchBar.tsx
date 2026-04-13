"use client";

import { CloseButton, Group, Input } from "@chakra-ui/react";

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
    <Group attached w={"full"}>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        background={"app.bg.card"}
        rounded={"2xl"}
        roundedRight={0}
      />
      <CloseButton
        aria-label={"Clear search"}
        variant={"outline"}
        rounded={"2xl"}
        roundedLeft={0}
        background={"app.bg.card"}
        onClick={onClear}
        disabled={!value}
      />
    </Group>
  );
}
