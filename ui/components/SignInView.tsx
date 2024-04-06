import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Container, Input, Stack, Pressable, Icon, Text } from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import { login } from "../services/api";
import { AppUser } from "../constants/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SignInView = ({
  setUser,
}: {
  setUser: Dispatch<SetStateAction<null | AppUser>>;
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("user").then((user) => {
      if (user) {
        setUser(JSON.parse(user));
      }
    });
  }, []);

  const handleSignIn = () => {
    login(username, password)
      .then((response: AppUser) => {
        setUser(response);
        AsyncStorage.setItem("user", JSON.stringify(response));
      })
      .catch((err) => {
        console.warn(err);
      });
  };

  return (
    <Container>
      <Stack space={4} w="100%" alignItems="center">
        <Input
          w={{
            base: "75%",
            md: "25%",
          }}
          InputLeftElement={
            <Icon
              as={<MaterialIcons name="person" />}
              size={5}
              ml="2"
              color="muted.400"
            />
          }
          value={username}
          onChangeText={setUsername}
          placeholder="Name"
        />
        <Input
          w={{
            base: "75%",
            md: "25%",
          }}
          type={show ? "text" : "password"}
          value={password}
          onChangeText={setPassword}
          InputRightElement={
            <Pressable onPress={() => setShow(!show)}>
              <Icon
                as={
                  <MaterialIcons
                    name={show ? "visibility" : "visibility-off"}
                  />
                }
                size={5}
                mr="2"
                color="muted.400"
              />
            </Pressable>
          }
          placeholder="Password"
        />
        <Pressable onPress={handleSignIn}>
          <Text>Sign In</Text>
        </Pressable>
      </Stack>
      ;
    </Container>
  );
};

export default SignInView;
