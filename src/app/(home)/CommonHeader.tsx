"use client";

import WithBackground from "@components/page/wrapper/WithBackground";
import WithHeader from "@components/page/wrapper/WithHeader";
import type { ReactNode } from "react";

export default function CommonHeader({ children }: { children: ReactNode }) {
  return (
    <WithBackground>
      <WithHeader>{children}</WithHeader>
    </WithBackground>
  );
}
