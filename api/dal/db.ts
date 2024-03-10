
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as constants from './constants'
import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core';
import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
dotenv.config();
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const hostname = process.env.DB_HOSTNAME;
console.log(`postgres://${username}:${password}@${hostname}/${constants.DATABASE_NAME}`);
const queryClient = postgres(`postgres://${username}:${password}@${hostname}/${constants.DATABASE_NAME}`);

export const db = drizzle(queryClient);
export const SHOPPING_LISTS = pgTable(constants.SHOPPING_LIST_TABLE, {
  id:  serial('id').primaryKey(),
  name: text('name'),
});

export const SHOPPING_LIST_ITEMS = pgTable(constants.SHOPPING_LIST_ITEMS_TABLE, {
  id:  serial('id').primaryKey(),
  name: text('name'),
  shoppingListId: integer('shopping_list_id').references(() => SHOPPING_LISTS.id),
});

export type ShoppingList = typeof SHOPPING_LISTS.$inferSelect;
export type NewShoppingList = typeof SHOPPING_LISTS.$inferInsert;

export type ShoppingListItem = typeof SHOPPING_LIST_ITEMS.$inferSelect;
export type NewShoppingListItem = typeof SHOPPING_LIST_ITEMS.$inferInsert;

export type ListWithItems = ShoppingList & { items: ShoppingListItem[] };

export const getListWithItems = async (id: number): Promise<ListWithItems> => {
  const list = await db.select().from(SHOPPING_LISTS).leftJoin(SHOPPING_LIST_ITEMS, eq(SHOPPING_LISTS.id, id))
  return {
    ...list[0].shopping_list,
    items: list.map((item) => item.shopping_list_items!)
  };
}

export const getAllLists = async (): Promise<ListWithItems[]> => {
  const lists = await db.select().from(SHOPPING_LISTS).leftJoin(SHOPPING_LIST_ITEMS, eq(SHOPPING_LISTS.id, SHOPPING_LIST_ITEMS.shoppingListId))
  return lists.reduce<ListWithItems[]>((acc, item) => {
    const existingList = acc.find((list) => list.id === item.shopping_list.id);
    if (existingList) {
      existingList.items.push(item.shopping_list_items!);
    } else {
      acc.push({ ...item.shopping_list, items: [item.shopping_list_items!] });
    }
    return acc;
  }, []);
}
