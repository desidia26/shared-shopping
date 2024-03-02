import { StyleSheet, Text, View } from "react-native";
import { ListWithItems } from "./constants/types";
import { useEffect, useState } from "react";
import { getLists } from "./services/api";
import ListsView from "./components/ListsView";

export default function App() {
  const [shoppingLists, setShoppingLists] = useState<ListWithItems[]>([]);

  useEffect(() => {
    (async () => {
      const lists = await getLists();
      setShoppingLists(lists);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text>'AS</Text>
      <ListsView lists={shoppingLists} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "grey",
    alignItems: "center",
    justifyContent: "center",
  },
});
