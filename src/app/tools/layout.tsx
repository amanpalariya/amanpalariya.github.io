"use client";

import WithBackground from "@components/page/wrapper/WithBackground";
import WithBodyCard from "@components/page/wrapper/WithBodyCard";
import WithFooter from "@components/page/wrapper/WithFooter";
import WithSocial from "@components/page/wrapper/WithSocial";
import WithToolsHeader from "@components/page/wrapper/WithToolsHeader";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WithBackground>
      <WithToolsHeader>
        <WithBodyCard>
          <WithFooter>
            <WithSocial>{children}</WithSocial>
          </WithFooter>
        </WithBodyCard>
      </WithToolsHeader>
    </WithBackground>
  );
}