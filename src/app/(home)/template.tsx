import type { ReactNode } from "react";
import CommonBody from "./CommonBody";

export default function Template({ children }: { children: ReactNode }) {
  return (
      <CommonBody>{children}</CommonBody>
  );
}
