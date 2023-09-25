import { SlideFade } from "@chakra-ui/react";
import CommonBody from "./CommonBody";

export default function Template({ children }) {
  return (
    <SlideFade in>
      <CommonBody>{children}</CommonBody>
    </SlideFade>
  );
}
