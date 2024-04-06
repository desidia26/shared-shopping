import React, { useCallback, useMemo } from "react";
import { View, Text, FlatList } from "react-native";
import { ListWithItems } from "../constants/types";
import {
  Button,
  DeleteIcon,
  Heading,
  IconButton,
  Input,
  Row,
} from "native-base";
import { addItemToList, deleteList, renameList } from "../services/api";
import ItemView from "./ItemView";

interface ListViewProps {
  list: ListWithItems;
}

const ListView: React.FC<ListViewProps> = ({ list }) => {
  const [newItemName, setNewItemName] = React.useState("");
  const [editing, setEditing] = React.useState(false);
  const [newName, setNewName] = React.useState(list.name);

  const handleAddItem = useCallback(() => {
    if (!newItemName) return;
    addItemToList(list.id, newItemName);
    setNewItemName("");
  }, [newItemName, list.id]);

  const sortedItems = useMemo(() => {
    if (!list.items) return [];
    return list.items.sort((a, b) => {
      if (!a || !b) return 0;
      return a.id - b.id;
    });
  }, [list.items]);

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
        {editing ? (
          <Input
            value={newName}
            onChangeText={setNewName}
            variant={"unstyled"}
            autoFocus={true}
            padding={0}
            margin={0}
            onBlur={() => {
              setEditing(false);
              if (newName !== list.name) {
                renameList(list.id, newName);
              }
            }}
          />
        ) : (
          <Heading onPress={() => setEditing(true)}>{list.name}</Heading>
        )}
        <IconButton
          onPress={() => deleteList(list.id)}
          variant={"ghost"}
          style={{ paddingRight: 0 }}
          icon={<DeleteIcon size="sm" />}
        ></IconButton>
      </Row>
      <FlatList
        data={sortedItems}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => {
          if (!item) return null;
          return <ItemView item={item} listId={list.id} />;
        }}
        ListFooterComponent={
          <View
            style={{
              flexDirection: "row",
              marginTop: 16,
              justifyContent: "space-between",
            }}
          >
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
