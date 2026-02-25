import { Box, Spacer } from "@chakra-ui/react";
import Header from "../common/Header";
import { HEADER_OFFSET_HEIGHT } from "../common/Header";

export default function WithHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <Spacer h={HEADER_OFFSET_HEIGHT} />
      {children}
    </>
  );
}
