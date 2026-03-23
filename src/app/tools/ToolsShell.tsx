"use client";

import WithBackground from "@components/page/wrapper/WithBackground";
import WithBodyCard from "@components/page/wrapper/WithBodyCard";
import WithFooter from "@components/page/wrapper/WithFooter";
import WithHeader from "@components/page/wrapper/WithHeader";

export default function ToolsShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WithBackground>
      <WithHeader>
        <WithFooter>
          <WithBodyCard>{children}</WithBodyCard>
        </WithFooter>
      </WithHeader>
    </WithBackground>
  );
}