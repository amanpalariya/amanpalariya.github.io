"use client";

import PageIntro from "@components/page/common/PageIntro";
import { Box, VStack } from "@chakra-ui/react";
import { useProseStyles } from "@components/article/proseStyles";

function Main({ html }: { html: string }) {
  const proseStyles = useProseStyles();

  return (
    <VStack align="stretch" gap={0}>
      <PageIntro
        title={
          <>
            It&apos;s me,{" "}
            <Box
              as="span"
              className="handwritten handwritten-squiggle squiggle-pink"
              fontFamily={"handwritten"}
              fontSize={"1.25em"}
              fontWeight={"black"}
            >
              Aman
            </Box>
            !
          </>
        }
      />
      <Box
        className="prose-content"
        css={proseStyles}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </VStack>
  );
}

export default function AboutClient({ html }: { html: string }) {
  return (
    <VStack align="stretch" gap={8}>
      <Main html={html} />
    </VStack>
  );
}
