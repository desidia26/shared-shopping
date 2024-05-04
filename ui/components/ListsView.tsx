import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  View,
  Text,
  FlatList,
  Modal,
  IconButton,
  DeleteIcon,
  Row,
} from "native-base";
import { addList, deleteNotification, getNotifications } from "../services/api";
import { ListContext } from "../contexts/ListContext";
import ListView from "./ListView";
import CustomTextInput from "./Inputs/CustomTextInput";

const ListsView: React.FC = () => {
  const { shoppingLists, user_id } = useContext(ListContext);
  const [notifications, setNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  useEffect(() => {
    getNotifications(user_id).then((notifications) => {
      if (notifications.length > 0) setShowModal(true);
      setNotifications(notifications);
    });
  }, [user_id]);

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
    <View
      style={{
        height: "100%",
        width: "80%",
      }}
    >
      <View
        style={{
          width: "100%",
          marginBottom: 16,
        }}
      >
        <CustomTextInput
          value={newListName}
          onChangeText={setNewListName}
          onSubmit={handleAddList}
          style={{ width: "100%", backgroundColor: "white" }}
          buttonStyle={{ backgroundColor: "white" }}
          placeholder="Add list..."
        />
      </View>
      <View
        style={{
          maxHeight: "90%",
        }}
      >
        <FlatList
          data={sortedLists}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => {
            if (!item) return null;
            return <ListView list={item} user_id={user_id} />;
          }}
        />
      </View>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Notifications</Modal.Header>
          <Modal.Body>
            <View
              style={{
                zIndex: 9999,
              }}
            >
              {notifications.map(
                (notification: { message: string; id: number }) => {
                  return (
                    <Row
                      key={notification.id}
                      style={{
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <Text>{notification.message}</Text>
                      <IconButton
                        onPress={() => {
                          deleteNotification(notification.id);
                          setNotifications(
                            notifications.filter(
                              (n: { id: number }) => n.id !== notification.id
                            )
                          );
                        }}
                        variant={"ghost"}
                        style={{ paddingRight: 0 }}
                        icon={<DeleteIcon size="sm" />}
                      ></IconButton>
                    </Row>
                  );
                }
              )}
            </View>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </View>
  );
};

export default ListsView;
