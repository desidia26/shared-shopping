export const DATABASE_NAME = 'shared_shopping';

export const USER_TABLE = 'users';
export const USER_COLUMNS = {
  ID: 'id',
  NAME: 'name',
  EMAIL: 'email',
};

export const SHOPPING_LIST_TABLE = 'shopping_list';
export const SHOPPING_LIST_COLUMNS = {
  ID: 'id',
};

export const SHOPPING_LIST_ITEMS_TABLE = 'shopping_list_items';
export const SHOPPING_LIST_ITEMS_COLUMNS = {
  ID: 'id',
  SHOPPING_LIST_ID: 'shopping_list_id',
  NAME: 'name',
  QUANTITY: 'quantity',
};

