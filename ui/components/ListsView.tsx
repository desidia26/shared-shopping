import React, { useCallback, useState } from "react";
import { View, Text, FlatList, Button, TextInput } from "react-native";
import { ListWithItems } from "../constants/types";
import { addList } from "../services/api";

interface ListsViewProps {
  lists: ListWithItems[];
}

const ListsView: React.FC<ListsViewProps> = ({ lists }) => {
  const [newListName, setNewListName] = useState("");

  const handleAddList = useCallback(() => {
    addList(newListName);
    setNewListName("");
  }, [newListName]);

  return (
    <View>
      <Text>Shopping Lists</Text>
      <TextInput
        value={newListName}
        onChangeText={setNewListName}
        placeholder="Enter list name"
      />
      <Button title="Add List" onPress={() => handleAddList()} />
      <FlatList
        data={lists}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item: list }) => (
          <View>
            <Text>{list.name}</Text>
            <FlatList
              data={list.items}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => <Text>{item.name}</Text>}
            />
          </View>
        )}
      />
    </View>
  );
};

export default ListsView;
