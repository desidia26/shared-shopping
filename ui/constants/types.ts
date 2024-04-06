interface ShoppingList {
  id: number;
  name: string;
}

interface ShoppingListItem {
  name: string;
  id: number;
  created_at?: string;
}

interface ListWithItems extends ShoppingList {
  items: ShoppingListItem[];
}

interface AppUser {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: string;
  updated_at: string;
}

export type { ShoppingList, ListWithItems, ShoppingListItem, AppUser };