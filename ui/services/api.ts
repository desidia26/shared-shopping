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

export { getLists, addList };