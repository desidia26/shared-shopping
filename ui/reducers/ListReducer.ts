import { ListWithItems } from "../constants/types";

export const ACTION_NAMES = {
  SET_LISTS: 'SET_LISTS',
  ADD_LIST: 'ADD_LIST',
  DELETE_LIST: 'DELETE_LIST',
  ADD_ITEM_TO_LIST: 'ADD_ITEM_TO_LIST',
  DELETE_ITEM_FROM_LIST: 'DELETE_ITEM_FROM_LIST',
  RENAME_LIST: 'RENAME_LIST',
  RENAME_ITEM: 'RENAME_ITEM',
};

interface SetListPayload {
  lists: ListWithItems[];
}

interface AddListPayload {
  list: ListWithItems;
}

interface DeleteListPayload {
  id: number;
}

interface AddItemToListPayload {
  listId: number;
  itemId: number;
  name: string;
  created_at?: string;
}

interface DeleteItemFromListPayload {
  listId: number;
  itemId: number;
}

interface RenameListPayload {
  id: number;
  name: string;
}

interface RenameItemPayload {
  listId: number;
  itemId: number;
  name: string;
}

type Action =
  | { type: typeof ACTION_NAMES.SET_LISTS, payload: SetListPayload }
  | { type: typeof ACTION_NAMES.ADD_LIST, payload: AddListPayload }
  | { type: typeof ACTION_NAMES.DELETE_LIST, payload: DeleteListPayload }
  | { type: typeof ACTION_NAMES.ADD_ITEM_TO_LIST, payload: AddItemToListPayload }
  | { type: typeof ACTION_NAMES.DELETE_ITEM_FROM_LIST, payload: DeleteItemFromListPayload }
  | { type: typeof ACTION_NAMES.RENAME_LIST, payload: RenameListPayload }
  | { type: typeof ACTION_NAMES.RENAME_ITEM, payload: RenameItemPayload };

export const listReducer = (state: ListWithItems[], action: Action) => {
  const newState = [...state];
  switch (action.type) {
    case ACTION_NAMES.SET_LISTS:
      return (action as { payload: SetListPayload }).payload.lists;
    case ACTION_NAMES.ADD_LIST:
      newState.push((action as { payload: AddListPayload }).payload.list);
      return newState;
    case ACTION_NAMES.DELETE_LIST:
      return newState.filter((list) => list.id !== (action as { payload: DeleteListPayload }).payload.id);
    case ACTION_NAMES.ADD_ITEM_TO_LIST:
      newState.forEach((list) => {
        if (list.id === (action as { payload: AddItemToListPayload }).payload.listId) {
          list.items.push({
            id: (action as { payload: AddItemToListPayload }).payload.itemId,
            name: (action as { payload: AddItemToListPayload }).payload.name,
          });
        }
      });
      return newState;
    case ACTION_NAMES.DELETE_ITEM_FROM_LIST:
      newState.forEach((list) => {
        if (list.id === (action as { payload: DeleteItemFromListPayload }).payload.listId) {
          list.items = list.items.filter((item) => item.id !== (action as { payload: DeleteItemFromListPayload }).payload.itemId);
        }
      });
      return newState;
    case ACTION_NAMES.RENAME_LIST:
      newState.forEach((list) => {
        if (list.id === (action as { payload: RenameListPayload }).payload.id) {
          list.name = (action as { payload: RenameListPayload }).payload.name;
        }
      });
      return newState;
    case ACTION_NAMES.RENAME_ITEM:
      newState.forEach((list) => {
        if (list.id === (action as { payload: RenameItemPayload }).payload.listId) {
          list.items.forEach((item) => {
            if (item.id === (action as { payload: RenameItemPayload }).payload.itemId) {
              item.name = (action as { payload: RenameItemPayload }).payload.name;
            }
          });
        }
      });
      return newState;
    default:
      return state;
  }
}
