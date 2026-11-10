import covers from "./covers.json";

type Book = {
  id: string;
  title: string;
  author: string;
  /** A base64 image data URL, ready to use as the image source. */
  cover: string;
  status?: "Reading" | "Read" | "Want to read";
  /** When the book was finished, as YYYY, YYYY-MM, or YYYY-MM-DD. */
  readOn?: string;
  /** Rating out of five. */
  rating?: number;
  review?: string;
};

// Sample reading records with covers from https://standardebooks.org/.
const books: Book[] = [
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
    status: "Reading",
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
    id: "the-time-machine",
    title: "The Time Machine",
    author: "H. G. Wells",
    cover: covers["the-time-machine"],
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

export const bookshelf = {
  isSample: true,
  books,
};
