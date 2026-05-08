"use client";

import WithBodyCard from "@components/page/wrapper/WithBodyCard";
import WithFooter from "@components/page/wrapper/WithFooter";
import type { ReactNode } from "react";

export default function CommonBody({ children }: { children: ReactNode }) {
  return (
    <WithFooter hideFooterBottomPart>
      <WithBodyCard>{children}</WithBodyCard>
    </WithFooter>
  );
}
