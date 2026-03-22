"use client";

import WithBackground from "@components/page/wrapper/WithBackground";
import WithBodyCard from "@components/page/wrapper/WithBodyCard";
import WithFooter from "@components/page/wrapper/WithFooter";
import WithToolsHeader from "@components/page/wrapper/WithToolsHeader";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WithBackground>
      <WithToolsHeader>
        <WithFooter>
          <WithBodyCard>
            {children}
          </WithBodyCard>
        </WithFooter>
      </WithToolsHeader>
    </WithBackground>
  );
}