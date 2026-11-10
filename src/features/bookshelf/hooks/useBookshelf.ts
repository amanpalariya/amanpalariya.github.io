"use client";

import { useEffect, useState } from "react";
import type { BookGroups } from "data/bookshelf";
import { getBookshelf } from "../services/bookshelf";

type BookshelfState =
  | { status: "loading" | "error" }
  | { status: "ready"; groups: BookGroups };

export function useBookshelf() {
  const [state, setState] = useState<BookshelfState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10_000);
    let active = true;

    getBookshelf(controller.signal)
      .then((groups) => {
        if (active) setState({ status: "ready", groups });
      })
      .catch(() => {
        if (active) setState({ status: "error" });
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  return state;
}
