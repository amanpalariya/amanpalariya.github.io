import { VStack, Text, Icon } from "@chakra-ui/react";
import { InnerBgCard } from "../../core/Cards";
import { Link } from "@chakra-ui/next-js";
import { PersonalData } from "data";
import { FiArrowUpRight } from "react-icons/fi";

export default function Footer() {
  return (
    <InnerBgCard>
      <VStack p={4} color={"gray.500"}>
        <Text fontSize={"sm"} textAlign={"center"}>
          Share your feedback/suggestions about this website on{" "}
          <Link href={PersonalData.linkedIn.url} target="_blank">
            LinkedIn <Icon as={FiArrowUpRight} boxSize={2.5} />
          </Link>
        </Text>
      </VStack>
    </InnerBgCard>
  );
}
