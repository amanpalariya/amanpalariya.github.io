import covers from "./covers.json";

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

// Sample reading records with covers from https://standardebooks.org/.
export const sampleBooks: (Book & { section?: keyof BookGroups })[] = [
  {
    id: "the-time-machine",
    title: "The Time Machine",
    author: "H. G. Wells",
    cover: covers["the-time-machine"],
  },
  {
    id: "frankenstein",
    title: "Frankenstein",
    author: "Mary Shelley",
    cover: covers.frankenstein,
    readOn: "2025-10-27",
    rating: 4.5,
    review: "The creature’s own account is the part that stayed with me.",
  },
  {
    id: "the-great-gatsby",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    cover: covers["the-great-gatsby"],
    readOn: "2025-11",
    rating: 4,
    review:
      "Gatsby’s parties are dazzling, but the quiet moments are what linger.",
  },
  {
    id: "pride-and-prejudice",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    cover: covers["pride-and-prejudice"],
    section: "reading",
  },
  {
    id: "the-picture-of-dorian-gray",
    title: "The Picture of Dorian Gray",
    author: "Oscar Wilde",
    cover: covers["the-picture-of-dorian-gray"],
  },
  {
    id: "anne-of-green-gables",
    title: "Anne of Green Gables",
    author: "L. M. Montgomery",
    cover: covers["anne-of-green-gables"],
  },
  {
    id: "meditations",
    title: "Meditations",
    author: "Marcus Aurelius",
    cover: covers.meditations,
  },
  {
    id: "the-call-of-the-wild",
    title: "The Call of the Wild",
    author: "Jack London",
    cover: covers["the-call-of-the-wild"],
  },
];

export const sampleBookshelf: BookGroups = {
  reading: sampleBooks.filter((book) => book.section === "reading"),
  wantToRead: [],
  read: sampleBooks
    .filter((book) => !book.section)
    .sort((a, b) => (b.readOn ?? "").localeCompare(a.readOn ?? "")),
};
