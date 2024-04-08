
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as constants from './constants'
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'local'}` });
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const hostname = process.env.DB_HOSTNAME;
console.log(`postgres://${username}:${password}@${hostname}/`);
const queryClient = postgres(`postgres://${username}:${password}@${hostname}/`);

// CREATE TABLE IF NOT EXISTS list_notification_subscription (
//   id SERIAL PRIMARY KEY,
//   user_id INT,
//   shopping_list_id INT,
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   FOREIGN KEY (user_id) REFERENCES app_user(id),
//   FOREIGN KEY (shopping_list_id) REFERENCES shopping_list(id)
// );


export const db = drizzle(queryClient);
export const SHOPPING_LISTS = pgTable(constants.SHOPPING_LIST_TABLE, {
  id:  serial('id').primaryKey(),
  name: text('name'),
  description: text('description'),
  shared: boolean('shared').default(false),
  user_id: integer('user_id'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const SHOPPING_LIST_ITEMS = pgTable(constants.SHOPPING_LIST_ITEMS_TABLE, {
  id:  serial('id').primaryKey(),
  name: text('name'),
  shoppingListId: integer('shopping_list_id').references(() => SHOPPING_LISTS.id),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const APP_USERS = pgTable(constants.APP_USER_TABLE, {
  id: serial('id').primaryKey(),
  name: text('name'),
  email: text('email'),
  password: text('password'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const SHOPPING_LIST_SHARED_USER = pgTable('shopping_list_shared_user', {
  shopping_list_id: integer('shopping_list_id').references(() => SHOPPING_LISTS.id),
  user_id: integer('user_id').references(() => APP_USERS.id),
});

export const LIST_NOTIFICATION_SUBSCRIPTION = pgTable('list_notification_subscription', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => APP_USERS.id),
  shopping_list_id: integer('shopping_list_id').references(() => SHOPPING_LISTS.id),
  created_at: timestamp('created_at').defaultNow(),
});

export type ListNotificationSubscription = typeof LIST_NOTIFICATION_SUBSCRIPTION.$inferSelect;
export type NewListNotificationSubscription = typeof LIST_NOTIFICATION_SUBSCRIPTION.$inferInsert;

export type ShoppingListSharedUser = typeof SHOPPING_LIST_SHARED_USER.$inferSelect;
export type NewShoppingListSharedUser = typeof SHOPPING_LIST_SHARED_USER.$inferInsert;

export type AppUser = typeof APP_USERS.$inferSelect;
export type NewAppUser = typeof APP_USERS.$inferInsert;

export type ShoppingList = typeof SHOPPING_LISTS.$inferSelect;
export type NewShoppingList = typeof SHOPPING_LISTS.$inferInsert;

export type ShoppingListItem = typeof SHOPPING_LIST_ITEMS.$inferSelect;
export type NewShoppingListItem = typeof SHOPPING_LIST_ITEMS.$inferInsert;

export type ListWithItems = ShoppingList & { items: ShoppingListItem[] };

export const getListWithItems = async (id: number): Promise<ListWithItems> => {
  const list = await db.select().from(SHOPPING_LISTS).leftJoin(SHOPPING_LIST_ITEMS, eq(SHOPPING_LISTS.id, id))
  return {
    ...list[0].shopping_list,
    items: list.map((item) => item.shopping_list_item!)
  };
}

export const getAllLists = async (user_id: number): Promise<ListWithItems[]> => {
  const lists = await db.select().from(SHOPPING_LISTS).where(eq(SHOPPING_LISTS.user_id, user_id)).leftJoin(SHOPPING_LIST_ITEMS, eq(SHOPPING_LISTS.id, SHOPPING_LIST_ITEMS.shoppingListId))
  const sharedLists = await db.select().from(SHOPPING_LISTS).leftJoin(SHOPPING_LIST_SHARED_USER, eq(SHOPPING_LISTS.id, SHOPPING_LIST_SHARED_USER.shopping_list_id)).where(eq(SHOPPING_LIST_SHARED_USER.user_id, user_id)).leftJoin(SHOPPING_LIST_ITEMS, eq(SHOPPING_LISTS.id, SHOPPING_LIST_ITEMS.shoppingListId))
  const combinedLists = lists.concat(sharedLists)
  return combinedLists.reduce<ListWithItems[]>((acc, item) => {
    const existingList = acc.find((list) => list.id === item.shopping_list.id);
    if (existingList) {
      existingList.items.push(item.shopping_list_item!);
    } else {
      acc.push({ ...item.shopping_list, items: [item.shopping_list_item!] });
    }
    return acc;
  }, []);
}
