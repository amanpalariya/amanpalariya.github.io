"use client";

import WithBodyCard from "@components/page/wrapper/WithBodyCard";
import WithFooter from "@components/page/wrapper/WithFooter";

export default function CommonBody({ children }) {
  return (
    <WithFooter hideFooterBottomPart>
      <WithBodyCard>{children}</WithBodyCard>
    </WithFooter>
  );
}
