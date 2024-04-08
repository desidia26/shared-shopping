import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Container,
  Input,
  Stack,
  Pressable,
  Icon,
  Text,
  Row,
  Button,
} from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import { getGuestUser, login } from "../services/api";
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

  const getGuest = useCallback(async () => {
    const user = await getGuestUser();
    console.log(user[0]);
    setUser(user[0]);
    AsyncStorage.setItem("user", JSON.stringify(user[0]));
  }, []);

  const handleSignIn = useCallback(() => {
    login(username, password)
      .then((response: AppUser) => {
        setUser(response);
        AsyncStorage.setItem("user", JSON.stringify(response));
      })
      .catch((err) => {
        console.warn(err);
      });
  }, []);

  return (
    <Container
      style={{
        backgroundColor: "grey",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
        maxWidth: "100%",
      }}
    >
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
              mr="2"
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
                marginLeft={2}
                mr="2"
                color="muted.400"
              />
            </Pressable>
          }
          placeholder="Password"
        />
        <Row>
          <Button onPress={() => handleSignIn()}>
            <Text color={"white"}>Sign In</Text>
          </Button>
          <Button
            onPress={() => getGuest()}
            style={{
              marginLeft: 24,
            }}
          >
            <Text color={"white"}>Guest Login</Text>
          </Button>
        </Row>
      </Stack>
      ;
    </Container>
  );
};

export default SignInView;
