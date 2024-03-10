import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { Row } from "native-base";
import { deleteItem } from "../services/api";
import { ShoppingListItem } from "../constants/types";

interface ItemViewProps {
  item: ShoppingListItem;
}

const ItemView: React.FC<ItemViewProps> = ({ item }) => {
  return (
    <Row justifyContent={"space-between"}>
      <Text>{item.name}</Text>
      <TouchableOpacity onPress={() => deleteItem(item.id)}>
        <Text>X</Text>
      </TouchableOpacity>
    </Row>
  );
};

export default ItemView;
