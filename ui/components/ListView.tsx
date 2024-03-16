import React, { useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { ListWithItems } from "../constants/types";
import {
  Button,
  DeleteIcon,
  Heading,
  Icon,
  IconButton,
  Input,
  Row,
} from "native-base";
import { addItemToList, deleteItem, deleteList } from "../services/api";
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
      <Row justifyContent="space-between" marginBottom={4}>
        <Heading>{list.name}</Heading>
        <IconButton
          onPress={() => deleteList(list.id)}
          variant={"ghost"}
          icon={<DeleteIcon size="sm" />}
        ></IconButton>
      </Row>
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
              marginRight={4}
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
