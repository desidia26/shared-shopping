
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as constants from './constants'
import { boolean, integer, json, pgTable, pgView, serial, text, timestamp } from 'drizzle-orm/pg-core';
import dotenv from 'dotenv';
import { and, eq } from 'drizzle-orm';

dotenv.config({ path: `.env.${process.env.NODE_ENV ?? 'local'}` });
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const hostname = process.env.DB_HOSTNAME;
console.log(`postgres://${username}:${password}@${hostname}/`);
const queryClient = postgres(`postgres://${username}:${password}@${hostname}/`);

export const db = drizzle(queryClient);

export const SHOPPING_LIST_WITH_ITEMS = pgView('shopping_list_with_items', {
  id: integer('id'),
  name: text('name'),
  description: text('description'),
  shared: boolean('shared'),
  user_id: integer('user_id'),
  created_at: timestamp('created_at'),
  updated_at: timestamp('updated_at'),
  items: json('items')
}).existing();

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
  created_by: integer('created_by'),
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

export const NOTIFICATIONS = pgTable('notification', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => APP_USERS.id),
  message: text('message'),
  created_at: timestamp('created_at').defaultNow(),
});


export type Notification = typeof NOTIFICATIONS.$inferSelect;
export type NewNotification = typeof NOTIFICATIONS.$inferInsert;

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

export type EnhancedListWithItems = ListWithItems & { subscribed: boolean };

export const getListWithItems = async (id: number): Promise<ListWithItems> => {
  const result = await db.select().from(SHOPPING_LIST_WITH_ITEMS).where(eq(SHOPPING_LISTS.id, id));
  // @ts-ignore
  return result;
}

export const getAllLists = async (user_id: number): Promise<EnhancedListWithItems[]> => {
  const myLists = await db.select().from(SHOPPING_LIST_WITH_ITEMS).where(eq(SHOPPING_LIST_WITH_ITEMS.user_id, user_id));
  const sharedListIds = await db.select({shopping_list_id: SHOPPING_LIST_SHARED_USER.shopping_list_id}).from(SHOPPING_LIST_SHARED_USER).where(eq(SHOPPING_LIST_SHARED_USER.user_id, user_id));

  const sharedLists = []
  for (const sharedListId of sharedListIds) {
    const sharedList = await db.select().from(SHOPPING_LIST_WITH_ITEMS).where(eq(SHOPPING_LIST_WITH_ITEMS.id, sharedListId.shopping_list_id!));
    const enhanced = sharedList[0] as EnhancedListWithItems;
    const subscribed = await db.select().from(LIST_NOTIFICATION_SUBSCRIPTION).where(and(eq(LIST_NOTIFICATION_SUBSCRIPTION.shopping_list_id, sharedListId.shopping_list_id!), eq(LIST_NOTIFICATION_SUBSCRIPTION.user_id, user_id)));
    if (subscribed.length > 0) {
      enhanced.subscribed = true;
    } else {
      enhanced.subscribed = false;
    }

    sharedLists.push(enhanced);
  }
  // @ts-ignore
  return [...myLists, ...sharedLists];
}
