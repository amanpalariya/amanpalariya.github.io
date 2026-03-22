import { Spacer } from "@chakra-ui/react";
import ToolsHeader, {
  TOOLS_HEADER_OFFSET_HEIGHT,
} from "@components/page/common/ToolsHeader";

export default function WithToolsHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ToolsHeader />
      <Spacer h={TOOLS_HEADER_OFFSET_HEIGHT} />
      {children}
    </>
  );
}