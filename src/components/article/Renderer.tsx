import { Box, Spacer, VStack } from "@chakra-ui/react";
import { SectionText } from "@components/core/Texts";

export default function ArticleRenderer({
  content,
  title,
}: {
  content: any[];
  title: string;
}) {
  return (
    <Box m={[4, 6]} letterSpacing={"wide"}>
      <VStack align={"stretch"} gap={"5"}>
        <SectionText>{title}</SectionText>
        <Spacer h={2} />
        {...content}
      </VStack>
    </Box>
  );
}
