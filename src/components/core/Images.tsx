"use client";

import { Center, Image, Text, VStack } from "@chakra-ui/react";
import { useColorModeValue } from "@components/ui/color-mode";

export function ImageBlock({
  src,
  caption,
  alt,
}: {
  src: string;
  caption?: string;
  alt?: string;
}) {
  return (
    <Center>
      <VStack
        p={[2, 4]}
        maxW={"5xl"}
        borderWidth={"thin"}
        rounded={"3xl"}
        borderColor={useColorModeValue("gray.200", "gray.600")}
        background={useColorModeValue("gray.100", "gray.900")}
      >
        <Image src={src} rounded={"xl"} alt={""} />
        {caption ? <Text>{caption}</Text> : null}
      </VStack>
    </Center>
  );
}
