import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { Input, Row } from "native-base";
import { deleteItem, renameItem } from "../services/api";
import { ShoppingListItem } from "../constants/types";

interface ItemViewProps {
  item: ShoppingListItem;
  listId: number;
}

const ItemView: React.FC<ItemViewProps> = ({ item, listId }) => {
  const [editing, setEditing] = React.useState(false);
  const [newName, setNewName] = React.useState(item.name);
  return (
    <Row justifyContent={"space-between"}>
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
            if (newName !== item.name) {
              renameItem(listId, item.id, newName);
            }
          }}
        />
      ) : (
        <Text onPress={() => setEditing(true)}>{item.name}</Text>
      )}
      <TouchableOpacity onPress={() => deleteItem(item.id, listId)}>
        <Text>X</Text>
      </TouchableOpacity>
    </Row>
  );
};

export default ItemView;
