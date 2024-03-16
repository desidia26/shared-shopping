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

export type { ShoppingList, ListWithItems, ShoppingListItem};