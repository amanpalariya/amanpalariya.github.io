"use client";

import WithBodyCard from "@components/page/wrapper/WithBodyCard";
import WithFooter from "@components/page/wrapper/WithFooter";
import WithSocial from "@components/page/wrapper/WithSocial";

export default function CommonBody({ children }) {
  return (
    <WithBodyCard>
      <WithFooter>
        <WithSocial>{children}</WithSocial>
      </WithFooter>
    </WithBodyCard>
  );
}
