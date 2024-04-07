import { ListWithItems } from "../constants/types";

const protocol = window.location.protocol
export const API_URL = protocol === 'https:' ? 'https://shared-shopping-api.fly.dev/' : 'http://localhost:3000/';

const getLists = async (user_id: number) : Promise<ListWithItems[]> => {
  const response = await fetch(`${API_URL}lists?user_id=${user_id}`);
  return response.json();
}

const addList = async (name: string, user_id: number) => {
  const response = await fetch(`${API_URL}lists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, user_id })
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

const renameList = async (listId: number, name: string) => {
  const response = await fetch(`${API_URL}lists/${listId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name })
  });
  return response.text();
}

const login = async (username: string, password: string) => {
  const response = await fetch(`${API_URL}login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });
  if (!response.ok) {
    throw new Error('Login failed');
  }
  return response.json();
}

export { getLists, addList, addItemToList, deleteItem, deleteList, renameItem, renameList, login };