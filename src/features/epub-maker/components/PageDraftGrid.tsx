import { HStack } from "@chakra-ui/react";
import type { PageDraft } from "../types";
import { PageDraftCard } from "./PageDraftCard";

export function PageDraftGrid({
  pages,
  onRemove,
  onRename,
  onMoveUp,
  onMoveDown,
}: {
  pages: PageDraft[];
  onRemove: (id: string) => void;
  onRename: (id: string, value: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}) {
  return (
    <HStack align={"start"} gap={4} wrap={"wrap"}>
      {pages.map((page, index) => (
        <PageDraftCard
          key={page.id}
          page={page}
          index={index}
          total={pages.length}
          onRemove={onRemove}
          onRename={onRename}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
        />
      ))}
    </HStack>
  );
}
