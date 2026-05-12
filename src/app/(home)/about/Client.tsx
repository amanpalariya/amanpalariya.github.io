"use client";

import { Heading1, SectionText } from "@components/core/Texts";
import { homepageTabs } from "app/route-info";
import { Box, Spacer, VStack } from "@chakra-ui/react";
import { useProseStyles } from "@components/article/proseStyles";

function Main({ html }: { html: string }) {
  const proseStyles = useProseStyles();

  return (
    <Box m={[4, 6]} letterSpacing={"wide"} lineHeight={"tall"}>
      <VStack align={"stretch"} gap={5}>
        <SectionText>{homepageTabs.about.name}</SectionText>
        <Spacer h={4} />
        <Heading1>
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
        </Heading1>
        <Box
          className="prose-content"
          css={proseStyles}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </VStack>
    </Box>
  );
}

export default function AboutClient({ html }: { html: string }) {
  return (
    <VStack align="stretch" gap={8}>
      <Main html={html} />
    </VStack>
  );
}
