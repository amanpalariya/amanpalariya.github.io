import { VisuallyHidden } from "@chakra-ui/react";
import type { Metadata } from "next";
import { getPageTitle } from "app/metadata";
import { homepageTabs } from "app/route-info";
import Bookshelf from "./Bookshelf";

const { name } = homepageTabs.bookshelf;

export const metadata: Metadata = {
  title: getPageTitle(name),
};

export default function BookshelfPage() {
  return (
    <>
      <VisuallyHidden as="h1">{name}</VisuallyHidden>
      <Bookshelf />
    </>
  );
}
