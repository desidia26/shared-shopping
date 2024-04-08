import React, { useCallback, useContext, useMemo, useState } from "react";
import { View, Text, FlatList, Button, Input } from "native-base";
import { addList } from "../services/api";
import { ListContext } from "../contexts/ListContext";
import ListView from "./ListView";

const ListsView: React.FC = () => {
  const { shoppingLists, user_id } = useContext(ListContext);
  const [newListName, setNewListName] = useState("");

  const handleAddList = useCallback(() => {
    addList(newListName, user_id);
    setNewListName("");
  }, [newListName]);

  const sortedLists = useMemo(() => {
    return shoppingLists.sort((a, b) => {
      return a.id - b.id;
    });
  }, [shoppingLists]);

  return (
    <View>
      <Text
        style={{
          maxWidth: 300,
          marginVertical: 16,
          backgroundColor: "white",
          padding: 8,
          textAlign: "center",
          borderRadius: 4,
        }}
      >
        This is a shared shopping app created for the Spring 2024 semester of
        CS-GY 6083 by Benjamin Banister. Inserting/Deleting new items/lists
        should be self explanatory. To update a list name or item name, just
        click on the current name and start typing.
        <br />
        <br />
        <a href="https://github.com/desidia26/shared-shopping">
          https://github.com/desidia26/shared-shopping
        </a>
      </Text>
      <View
        style={{
          flexDirection: "row",
          marginBottom: 16,
          justifyContent: "space-between",
        }}
      >
        <Input
          value={newListName}
          onChangeText={setNewListName}
          placeholder="Enter list name"
          style={{ backgroundColor: "white" }}
        />
        <Button
          onPress={() => handleAddList()}
          style={{
            marginLeft: 56,
          }}
        >
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
