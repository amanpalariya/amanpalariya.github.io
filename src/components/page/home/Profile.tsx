import {
  Box,
  useBreakpointValue,
  Stack,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { Heading1, SubtitleText } from "../../core/Texts";
import HomepageAvatar from "./HomepageAvatar";
import { PersonalData } from "data";
import CopyEmailButton from "../common/CopyEmailSecondaryButton";
import LinkedInButton from "../common/LinkedInPrimaryButton";

export default function Profile() {
  const showVerticalProfile = useBreakpointValue({ base: true, md: false });

  return (
    <Stack
      direction={showVerticalProfile ? "column-reverse" : "row"}
      align={"center"}
      justify={"space-between"}
      gap={showVerticalProfile ? 6 : 9}
    >
      <VStack align={showVerticalProfile ? "center" : "start"} gap={6}>
        <VStack align={showVerticalProfile ? "center" : "start"} gap={3}>
          <Heading1
            centerAlign={showVerticalProfile}
          >{`I'm ${PersonalData.name.full}`}</Heading1>
          <SubtitleText centerAlign={showVerticalProfile}>
            {PersonalData.intro.short}
          </SubtitleText>
        </VStack>
        <HStack>
          <LinkedInButton />
          <CopyEmailButton />
        </HStack>
      </VStack>
      <Box p={2}>
        <HomepageAvatar
          src={PersonalData.avatar.url}
          name={PersonalData.name.full}
        />
      </Box>
    </Stack>
  );
}
