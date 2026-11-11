import type { Book, BookGroups } from "data/bookshelf";
import { requestAppsScript } from "../../../services/apps-script";

type ApiBook = {
  title: string;
  author: string | null;
  coverUrl: string | null;
  firstReadOn: string | null;
  rereadDates: string[];
  ratingOutOf10: number | null;
  review: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isApiBook(value: unknown): value is ApiBook {
  return (
    isRecord(value) &&
    typeof value.title === "string" &&
    isNullableString(value.author) &&
    isNullableString(value.coverUrl) &&
    isNullableString(value.firstReadOn) &&
    Array.isArray(value.rereadDates) &&
    value.rereadDates.every((date) => typeof date === "string") &&
    (value.ratingOutOf10 === null || typeof value.ratingOutOf10 === "number") &&
    isNullableString(value.review)
  );
}

function coverSource(value: string | null): string | undefined {
  if (!value || value.startsWith("data:image/")) return value ?? undefined;

  try {
    return new URL(value).protocol === "https:" ? value : undefined;
  } catch {
    return undefined;
  }
}

function parseBooks(value: unknown, section: keyof BookGroups): Book[] {
  if (!Array.isArray(value) || !value.every(isApiBook)) {
    throw new Error(`Invalid bookshelf section: ${section}.`);
  }

  return value.map((book, index) => {
    const readOn = book.rereadDates.reduce(
      (latest, date) => (date > latest ? date : latest),
      book.firstReadOn ?? "",
    );

    return {
      id: `${section}-${index}`,
      title: book.title,
      author: book.author ?? undefined,
      cover: coverSource(book.coverUrl),
      readOn: readOn || undefined,
      rating: book.ratingOutOf10 === null ? undefined : book.ratingOutOf10 / 2,
      review: book.review ?? undefined,
    };
  });
}

function parseBookshelf(value: unknown): BookGroups {
  if (!isRecord(value)) throw new Error("Invalid bookshelf response.");

  return {
    reading: parseBooks(value.reading, "reading"),
    wantToRead: parseBooks(value.wantToRead, "wantToRead"),
    read: parseBooks(value.read, "read"),
  };
}

export function getBookshelf(signal?: AbortSignal): Promise<BookGroups> {
  return requestAppsScript("v1/bookshelf", parseBookshelf, signal);
}
