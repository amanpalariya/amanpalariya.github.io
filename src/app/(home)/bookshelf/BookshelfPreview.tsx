"use client";

import { Box, chakra, Grid, NativeSelect } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { sampleBooks, sampleBookshelf, type BookGroups } from "data/bookshelf";
import Bookshelf, { bookshelfSections } from "./Bookshelf";

const countOptions = Array.from(
  { length: sampleBooks.length + 1 },
  (_, count) => count,
);

export default function BookshelfPreview({
  children,
}: {
  children: ReactNode;
}) {
  const searchParams = useSearchParams();
  const [counts, setCounts] = useState({
    reading: sampleBookshelf.reading.length,
    read: sampleBookshelf.read.length,
    wantToRead: sampleBookshelf.wantToRead.length,
  });

  if (!searchParams.has("preview")) return children;

  function previewBooks(section: keyof BookGroups) {
    const original = sampleBookshelf[section];
    const extras = sampleBooks.filter((book) => !original.includes(book));
    return [...original, ...extras].slice(0, counts[section]);
  }

  const groups = {
    reading: previewBooks("reading"),
    wantToRead: previewBooks("wantToRead"),
    read: previewBooks("read"),
  };

  return (
    <>
      <Box as="fieldset" mb={6} minW={0}>
        <Box as="legend" mb={2} fontSize="sm" fontWeight="semibold">
          Preview book counts
        </Box>
        <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap={2}>
          {bookshelfSections.map(({ section, id, title }) => {
            const controlId = `preview-${id}`;
            return (
              <Box key={section} display="flex" flexDirection="column" gap={1}>
                <chakra.label htmlFor={controlId} fontSize="sm" flex={1}>
                  {title}
                </chakra.label>
                <NativeSelect.Root size="sm">
                  <NativeSelect.Field
                    id={controlId}
                    value={counts[section]}
                    onChange={(event) =>
                      setCounts({
                        ...counts,
                        [section]: Number(event.target.value),
                      })
                    }
                  >
                    {countOptions.map((count) => (
                      <option key={count} value={count}>
                        {count}
                      </option>
                    ))}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Box>
            );
          })}
        </Grid>
      </Box>
      <Bookshelf groups={groups} isSample preview />
    </>
  );
}
