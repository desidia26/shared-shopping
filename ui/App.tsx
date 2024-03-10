import { StyleSheet, View } from "react-native";
import ListsView from "./components/ListsView";
import { NativeBaseProvider } from "native-base";
import { ListProvider } from "./contexts/ListContext";

export default function App() {
  return (
    <NativeBaseProvider>
      <View style={styles.container}>
        <ListProvider>
          <ListsView />
        </ListProvider>
      </View>
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
