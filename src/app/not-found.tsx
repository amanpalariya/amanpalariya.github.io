"use client";

import { Text, VStack } from "@chakra-ui/react";
import { Center } from "@chakra-ui/react";
import { Heading1, LinkText, SubtitleText } from "@components/core/Texts";
import { PersonalData } from "data";

export default function Error() {
  return (
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
  );
}
