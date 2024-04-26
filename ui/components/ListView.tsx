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
  ShareIcon,
  Modal,
  FormControl,
  Tooltip,
} from "native-base";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  addItemToList,
  deleteList,
  renameList,
  shareList,
  subscribeToList,
  unsubscribeFromList,
} from "../services/api";
import ItemView from "./ItemView";

interface ListViewProps {
  list: ListWithItems;
  user_id: number;
}

const ListView: React.FC<ListViewProps> = ({ list, user_id }) => {
  const [newItemName, setNewItemName] = React.useState("");
  const [editing, setEditing] = React.useState(false);
  const [newName, setNewName] = React.useState(list.name);
  const [showModal, setShowModal] = React.useState(false);
  const [sharedUsername, setSharedUsername] = React.useState("");

  const handleAddItem = useCallback(() => {
    if (!newItemName) return;
    addItemToList(list.id, newItemName, user_id);
    setNewItemName("");
  }, [newItemName, list.id]);

  const handleShareList = useCallback(() => {
    setShowModal(true);
  }, []);

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
          <Tooltip label="Click here to edit" openDelay={500}>
            <Heading onPress={() => setEditing(true)}>{list.name}</Heading>
          </Tooltip>
        )}
        <Row>
          {list.shared &&
            (!list.subscribed ? (
              <IconButton
                icon={
                  <Ionicons
                    name="notifications"
                    size={16}
                    color={"rgb(8, 145, 178)"}
                  />
                }
                onPress={() => {
                  subscribeToList(list.id, user_id);
                }}
                style={{ paddingRight: 0 }}
              ></IconButton>
            ) : (
              <IconButton
                icon={
                  <Ionicons
                    name="notifications-off"
                    size={16}
                    color={"rgb(8, 145, 178)"}
                  />
                }
                onPress={() => {
                  unsubscribeFromList(list.id, user_id);
                }}
                style={{ paddingRight: 0 }}
              ></IconButton>
            ))}
          <IconButton
            onPress={handleShareList}
            variant={"ghost"}
            style={{ paddingRight: 0 }}
            icon={<ShareIcon size="sm" />}
          ></IconButton>
          <IconButton
            onPress={() => deleteList(list.id)}
            variant={"ghost"}
            style={{ paddingRight: 0 }}
            icon={<DeleteIcon size="sm" />}
          ></IconButton>
        </Row>
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
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Share List</Modal.Header>
          <Modal.Body>
            <FormControl>
              <FormControl.Label>Username</FormControl.Label>
              <Input
                value={sharedUsername}
                onChangeText={setSharedUsername}
                placeholder="Enter username"
              />
            </FormControl>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button
                variant="ghost"
                colorScheme="blueGray"
                onPress={() => {
                  setShowModal(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onPress={() => {
                  setShowModal(false);
                  shareList(list.id, sharedUsername);
                  setSharedUsername("");
                }}
              >
                Save
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </View>
  );
};

export default ListView;
