"use client";

import { Text, VStack } from "@chakra-ui/react";
import { Center } from "@chakra-ui/react";
import { Heading1, LinkText, SubtitleText } from "@components/core/Texts";
import WithBackground from "@components/page/wrapper/WithBackground";
import { PersonalData } from "data";
import { Providers } from "./providers";

export default function Error() {
  return (
    <Providers>
      <WithBackground>
        <Center h={"100vh"}>
          <VStack gap={8}>
            <Heading1 centerAlign>Dear explorer, are you lost?</Heading1>
            <Text>
              <LinkText href="/">Go back home</LinkText>
            </Text>
            <SubtitleText>
              Or contact the developer on{" "}
              <LinkText href={PersonalData.linkedIn.url} isExternal>
                LinkedIn
              </LinkText>
            </SubtitleText>
          </VStack>
        </Center>
      </WithBackground>
    </Providers>
  );
}
