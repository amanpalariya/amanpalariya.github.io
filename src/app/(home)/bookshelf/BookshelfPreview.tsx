"use client";

import { Box, chakra, Grid, NativeSelect } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { bookshelf } from "data/bookshelf";
import Bookshelf, { bookshelfSections, groupBooks } from "./Bookshelf";

const originalGroups = groupBooks(bookshelf.books);
const countOptions = Array.from(
  { length: bookshelf.books.length + 1 },
  (_, count) => count,
);

export default function BookshelfPreview({
  children,
}: {
  children: ReactNode;
}) {
  const searchParams = useSearchParams();
  const [counts, setCounts] = useState({
    Reading: originalGroups.Reading.length,
    Read: originalGroups.Read.length,
    "Want to read": originalGroups["Want to read"].length,
  });

  if (!searchParams.has("preview")) return children;

  const previewBooks = bookshelfSections.flatMap(({ status }) => {
    const original = originalGroups[status];
    const extras = bookshelf.books.filter((book) => !original.includes(book));
    return [...original, ...extras]
      .slice(0, counts[status])
      .map((book) => ({ ...book, status }));
  });

  return (
    <>
      <Box as="fieldset" mb={6} minW={0}>
        <Box as="legend" mb={2} fontSize="sm" fontWeight="semibold">
          Preview book counts
        </Box>
        <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap={2}>
          {bookshelfSections.map(({ status, id, title }) => {
            const controlId = `preview-${id}`;
            return (
              <Box key={status} display="flex" flexDirection="column" gap={1}>
                <chakra.label htmlFor={controlId} fontSize="sm" flex={1}>
                  {title}
                </chakra.label>
                <NativeSelect.Root size="sm">
                  <NativeSelect.Field
                    id={controlId}
                    value={counts[status]}
                    onChange={(event) =>
                      setCounts({
                        ...counts,
                        [status]: Number(event.target.value),
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
      <Bookshelf books={previewBooks} isSample />
    </>
  );
}
