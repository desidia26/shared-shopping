interface ShoppingList {
  id: number;
  name: string;
}

interface ShoppingListItem {
  name: string;
  id: number;
}

interface ListWithItems extends ShoppingList {
  items: ShoppingListItem[];
}

export type { ShoppingList, ListWithItems, ShoppingListItem};