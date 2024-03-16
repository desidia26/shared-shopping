import { ListWithItems } from "../constants/types";

const API_URL = 'http://localhost:8000/';

const getLists = async () : Promise<ListWithItems[]> => {
  const response = await fetch(`${API_URL}lists`);
  return response.json();
}

const addList = async (name: string) => {
  const response = await fetch(`${API_URL}lists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name })
  });
  return response.text();
}

const addItemToList = async (listId: number, name: string) => {
  const response = await fetch(`${API_URL}lists/${listId}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name })
  });
  return response.text();
}

const deleteList = async (listId: number) => {
  console.log(listId)
  const response = await fetch(`${API_URL}lists/${listId}`, {
    method: 'DELETE',
  });
  return response.text();
}

const deleteItem = async (itemId: number, listId: number) => {
  const response = await fetch(`${API_URL}lists/${listId}/items/${itemId}`, {
    method: 'DELETE',
  });
  return response.text();
}

const renameItem = async (listId: number, itemId: number, name: string) => {
  const response = await fetch(`${API_URL}lists/${listId}/items/${itemId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name })
  });
  return response.text();
}

export { getLists, addList, addItemToList, deleteItem, deleteList, renameItem };