
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as constants from './constants'
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
dotenv.config();
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const hostname = process.env.DB_HOSTNAME;
console.log(`postgres://${username}:${password}@${hostname}/${constants.DATABASE_NAME}`);
const queryClient = postgres(`postgres://${username}:${password}@${hostname}/${constants.DATABASE_NAME}`);

// CREATE TABLE IF NOT EXISTS app_user (
//   id SERIAL PRIMARY KEY,
//   name VARCHAR(50),
//   email VARCHAR(100),
//   password VARCHAR(100),
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// CREATE TABLE IF NOT EXISTS shopping_list (
//   id SERIAL PRIMARY KEY,
//   name VARCHAR(100),
//   description TEXT,
//   user_id INT,
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   FOREIGN KEY (user_id) REFERENCES app_user(id)
// );
// CREATE TABLE IF NOT EXISTS shopping_list_shared_user (
//   shopping_list_id INT,
//   user_id INT,
//   PRIMARY KEY (shopping_list_id, user_id),
//   FOREIGN KEY (shopping_list_id) REFERENCES shopping_list(id),
//   FOREIGN KEY (user_id) REFERENCES app_user(id)
// );

// CREATE TABLE IF NOT EXISTS shopping_list_item (
//   id SERIAL PRIMARY KEY,
//   shopping_list_id INT,
//   name VARCHAR(100),
//   quantity INT,
//   completed BOOLEAN DEFAULT FALSE,
//   notes TEXT,
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   FOREIGN KEY (shopping_list_id) REFERENCES shopping_list(id)
// );

export const db = drizzle(queryClient);
export const SHOPPING_LISTS = pgTable(constants.SHOPPING_LIST_TABLE, {
  id:  serial('id').primaryKey(),
  name: text('name'),
  description: text('description'),
  user_id: integer('user_id'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const SHOPPING_LIST_ITEMS = pgTable(constants.SHOPPING_LIST_ITEMS_TABLE, {
  id:  serial('id').primaryKey(),
  name: text('name'),
  shoppingListId: integer('shopping_list_id').references(() => SHOPPING_LISTS.id),
  quantity: integer('quantity'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  completed: boolean('completed').default(false),
  notes: text('notes'),
});

export const APP_USERS = pgTable(constants.APP_USER_TABLE, {
  id: serial('id').primaryKey(),
  name: text('name'),
  email: text('email'),
  password: text('password'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

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
  return lists.reduce<ListWithItems[]>((acc, item) => {
    const existingList = acc.find((list) => list.id === item.shopping_list.id);
    if (existingList) {
      existingList.items.push(item.shopping_list_item!);
    } else {
      acc.push({ ...item.shopping_list, items: [item.shopping_list_item!] });
    }
    return acc;
  }, []);
}
