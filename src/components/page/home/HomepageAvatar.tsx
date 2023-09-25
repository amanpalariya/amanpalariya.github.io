import { useColorModeValue, Avatar, Box } from "@chakra-ui/react";

export default function HomepageAvatar({
  src,
  name,
}: {
  src?: string;
  name?: string;
}) {
  return (
    <Box
      rounded={"full"}
      p={2}
      borderWidth={"thick"}
      borderColor={useColorModeValue("gray.200", "gray.600")}
    >
      <Avatar src={src} name={name} size={"2xl"} />
    </Box>
  );
}
