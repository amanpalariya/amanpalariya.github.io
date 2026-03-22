import { Box, SimpleGrid } from "@chakra-ui/react";
import { useState } from "react";
import type { PageDraft } from "../types";
import { PageDraftCard } from "./PageDraftCard";

export function PageDraftGrid({
  pages,
  onRemove,
  onRename,
  onReorder,
}: {
  pages: PageDraft[];
  onRemove: (id: string) => void;
  onRename: (id: string, value: string) => void;
  onReorder: (draggedId: string, targetIndex: number) => void;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const dragIndex =
    draggedId == null ? -1 : pages.findIndex((page) => page.id === draggedId);

  const previewPages =
    draggedId && dropIndex !== null && dragIndex >= 0
      ? (() => {
          const draggedPage = pages[dragIndex];
          const remaining = pages.filter((page) => page.id !== draggedId);
          const insertionIndex = Math.max(0, Math.min(dropIndex, remaining.length));
          const next = [...remaining];
          next.splice(insertionIndex, 0, draggedPage);
          return next;
        })()
      : pages;

  function handleDrop() {
    if (!draggedId) return;
    onReorder(draggedId, dropIndex ?? dragIndex);
    setDraggedId(null);
    setDropIndex(null);
  }

  function handleDragEnd() {
    setDraggedId(null);
    setDropIndex(null);
  }

  function effectiveDropIndex(index: number) {
    if (!draggedId) return null;
    return dropIndex === index ? index : null;
  }

  return (
    <SimpleGrid
      columns={{ base: 1, md: 2, lg: 3 }}
      gap={2}
      alignItems={"start"}
    >
      {previewPages.map((page, index) => {
        const isDraggedCard = draggedId === page.id;
        const isDropTarget = effectiveDropIndex(index) !== null;

        return (
          <Box
            key={page.id}
            onDragOver={(event) => {
              event.preventDefault();
              if (!draggedId) return;
              if (draggedId === page.id) return;
              setDropIndex(index);
            }}
            onDrop={(event) => {
              event.preventDefault();
              handleDrop();
            }}
          >
            <PageDraftCard
              page={page}
              chapterNumber={index + 1}
              onRemove={onRemove}
              onRename={onRename}
              onDragStart={(id) => {
                setDraggedId(id);
                setDropIndex(index);
              }}
              onDragEnd={handleDragEnd}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              isDragging={isDraggedCard}
              isDropTarget={isDropTarget}
            />
          </Box>
        );
      })}
    </SimpleGrid>
  );
}
