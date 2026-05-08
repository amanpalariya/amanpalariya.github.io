"use client";

import { Text, VStack } from "@chakra-ui/react";
import { Center } from "@chakra-ui/react";
import { Heading1, LinkText, SubtitleText } from "@components/core/Texts";
import WithBackground from "@components/page/wrapper/WithBackground";
import { PersonalData } from "data";
import { Providers } from "./providers";
import { notFoundContent } from "./not-found-content";

export default function Error() {
  return (
    <Providers>
      <WithBackground>
        <Center h={"100vh"}>
          <VStack gap={8}>
            <Heading1 centerAlign>{notFoundContent.title}</Heading1>
            <Text>
              <LinkText href="/">{notFoundContent.homeLinkLabel}</LinkText>
            </Text>
            <SubtitleText>
              {notFoundContent.contactPrefix}{" "}
              <LinkText href={PersonalData.linkedIn.url} isExternal>
                {notFoundContent.contactLinkLabel}
              </LinkText>
            </SubtitleText>
          </VStack>
        </Center>
      </WithBackground>
    </Providers>
  );
}
