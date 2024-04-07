import { StyleSheet, View } from "react-native";
import ListsView from "./components/ListsView";
import { NativeBaseProvider } from "native-base";
import { ListProvider } from "./contexts/ListContext";
import { useState } from "react";
import SignInView from "./components/SignInView";
import { AppUser } from "./constants/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
// @ts-ignore
window.clearAsync = () => AsyncStorage.clear();
export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);

  return (
    <NativeBaseProvider>
      {!user ? (
        // @ts-ignore
        <SignInView setUser={setUser} />
      ) : (
        <View style={styles.container}>
          <ListProvider user_id={user.id}>
            <ListsView />
          </ListProvider>
        </View>
      )}
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "grey",
    alignItems: "center",
  },
});
