import React, { createContext, useEffect, useMemo, useReducer } from "react";
import { ListWithItems } from "../constants/types";
import { getLists } from "../services/api";
import { ACTION_NAMES, listReducer } from "../reducers/ListReducer";

interface ListContextProps {
  shoppingLists: ListWithItems[];
}

const ListContext = createContext<ListContextProps>({
  shoppingLists: [],
} as ListContextProps);

const ListProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [shoppingLists, dispatch] = useReducer(listReducer, []);

  useEffect(() => {
    (async () => {
      const lists = await getLists();
      dispatch({ type: ACTION_NAMES.SET_LISTS, payload: { lists } });
    })();
  }, []);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000");
    ws.onopen = () => {
      console.log("Connected to ws");
    };
    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      switch (data.action) {
        case "addList":
          dispatch({
            type: ACTION_NAMES.ADD_LIST,
            payload: { list: data.list },
          });
          break;
        case "deleteList":
          dispatch({
            type: ACTION_NAMES.DELETE_LIST,
            payload: { id: data.id },
          });
          break;
        case "addItemToList":
          dispatch({
            type: ACTION_NAMES.ADD_ITEM_TO_LIST,
            payload: {
              listId: data.listId,
              itemId: data.itemId,
              name: data.name,
              created_at: data.created_at,
            },
          });
          break;
        case "deleteItemFromList":
          dispatch({
            type: ACTION_NAMES.DELETE_ITEM_FROM_LIST,
            payload: { listId: data.listId, itemId: data.itemId },
          });
          break;
        case "renameList":
          dispatch({
            type: ACTION_NAMES.RENAME_LIST,
            payload: { id: data.id, name: data.name },
          });
          break;
        case "renameItem":
          dispatch({
            type: ACTION_NAMES.RENAME_ITEM,
            payload: {
              listId: data.listId,
              itemId: data.itemId,
              name: data.name,
            },
          });
          break;
        default:
          console.log("Unknown action", data.action);
      }
    };
    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    (async () => {
      const lists = await getLists();
      dispatch({ type: ACTION_NAMES.SET_LISTS, payload: { lists } });
    })();
  }, []);
  const value = useMemo(() => ({ shoppingLists }), [shoppingLists]);

  return <ListContext.Provider value={value}>{children}</ListContext.Provider>;
};

export { ListContext, ListProvider };
