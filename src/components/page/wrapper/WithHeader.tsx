import { Box, Spacer } from "@chakra-ui/react";
import Header from "../common/Header";

export default function WithHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <Spacer h={24} />
      {children}
    </>
  );
}
