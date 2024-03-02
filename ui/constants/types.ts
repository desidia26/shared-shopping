interface ShoppingList {
  id: number;
  name: string;
}

interface ShoppingListItem {
  name: string;
}

interface ListWithItems extends ShoppingList {
  items: ShoppingListItem[];
}

export type { ShoppingList, ListWithItems };