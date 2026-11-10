export type Book = {
  id: string;
  title: string;
  author?: string;
  cover?: string;
  /** When the book was finished, as YYYY, YYYY-MM, or YYYY-MM-DD. */
  readOn?: string;
  /** Rating out of five. */
  rating?: number;
  review?: string;
};

export type BookGroups = Record<"reading" | "wantToRead" | "read", Book[]>;
