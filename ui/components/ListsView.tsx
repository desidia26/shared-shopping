import React, { useCallback, useContext, useMemo, useState } from "react";
import { View, Text, FlatList, Button, Input } from "native-base";
import { addList } from "../services/api";
import { ListContext } from "../contexts/ListContext";
import ListView from "./ListView";

const ListsView: React.FC = () => {
  const { shoppingLists } = useContext(ListContext);
  const [newListName, setNewListName] = useState("");

  const handleAddList = useCallback(() => {
    addList(newListName);
    setNewListName("");
  }, [newListName]);

  const sortedLists = useMemo(() => {
    return shoppingLists.sort((a, b) => {
      return a.id - b.id;
    });
  }, [shoppingLists]);

  return (
    <View>
      <View style={{ flexDirection: "row", marginBottom: 16 }}>
        <Input
          value={newListName}
          onChangeText={setNewListName}
          placeholder="Enter list name"
        />
        <Button onPress={() => handleAddList()}>
          <Text>Add List</Text>
        </Button>
      </View>
      <FlatList
        data={sortedLists}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => {
          if (!item) return null;
          return <ListView list={item} />;
        }}
      />
    </View>
  );
};

export default ListsView;
