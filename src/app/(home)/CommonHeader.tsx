"use client";

import WithBackground from "@components/page/wrapper/WithBackground";
import WithHeader from "@components/page/wrapper/WithHeader";

export default function CommonHeader({ children }) {
  return (
    <WithBackground>
      <WithHeader>{children}</WithHeader>
    </WithBackground>
  );
}
