"use client";

import { useEffect, useState } from "react";
import type { BookGroups } from "data/bookshelf";
import { AppsScriptRequestError } from "../../../services/apps-script";
import { getBookshelf } from "../services/bookshelf";

export type BookshelfErrorReason =
  AppsScriptRequestError["reason"] | "timeout" | "unknown";

type BookshelfState =
  | { status: "loading" | "retrying" }
  | { status: "error"; reason: BookshelfErrorReason }
  | { status: "ready"; groups: BookGroups };

export function useBookshelf() {
  const [state, setState] = useState<BookshelfState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10_000);
    let active = true;

    getBookshelf(controller.signal)
      .then((groups) => {
        if (active) setState({ status: "ready", groups });
      })
      .catch((error: unknown) => {
        if (!active) return;
        let reason: BookshelfErrorReason = "unknown";
        if (controller.signal.aborted) reason = "timeout";
        else if (error instanceof AppsScriptRequestError) reason = error.reason;
        setState({ status: "error", reason });
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);

  function retry() {
    if (state.status !== "error") return;
    setState({ status: "retrying" });
    setAttempt((previous) => previous + 1);
  }

  return { state, retry };
}
