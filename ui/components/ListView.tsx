import React, { useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { ListWithItems } from "../constants/types";
import { Button, Heading, Input, Row } from "native-base";
import { addItemToList, deleteItem } from "../services/api";
import ItemView from "./ItemView";

interface ListViewProps {
  list: ListWithItems;
}

const ListView: React.FC<ListViewProps> = ({ list }) => {
  const [newItemName, setNewItemName] = React.useState("");

  const handleAddItem = useCallback(() => {
    addItemToList(list.id, newItemName);
    setNewItemName("");
  }, [newItemName, list.id]);

  return (
    <View
      style={{
        marginBottom: 16,
        padding: 16,
        backgroundColor: "white",
        borderRadius: 4,
      }}
    >
      <Heading>{list.name}</Heading>
      <FlatList
        data={list.items}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => {
          if (!item) return null;
          return <ItemView item={item} />;
        }}
        ListFooterComponent={
          <View style={{ flexDirection: "row", marginTop: 16 }}>
            <Input
              value={newItemName}
              onChangeText={setNewItemName}
              placeholder="Enter item name"
            />
            <Button onPress={() => handleAddItem()}>
              <Text>Add Item</Text>
            </Button>
          </View>
        }
      />
    </View>
  );
};

export default ListView;
