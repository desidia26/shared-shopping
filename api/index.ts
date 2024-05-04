
import express, {Request, Response , Application } from 'express';
import dotenv from 'dotenv';
import {SHOPPING_LISTS, SHOPPING_LIST_ITEMS, APP_USERS, db, SHOPPING_LIST_SHARED_USER, LIST_NOTIFICATION_SUBSCRIPTION, NOTIFICATIONS, COMMON_ITEMS, SHOPPING_LIST_WITH_ITEMS, EnhancedListWithItems} from './dal/db'
import { and, eq, ilike, sql } from 'drizzle-orm';
import WebSocket from 'ws';
dotenv.config();

const app: Application = express();
const port = process.env.PORT ?? 8000;


// enable CORS
app.use((req: Request, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});
app.use(express.json());

const sendMessageToClients = (obj: object) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(obj));
    }
  });
}

const sendMessageToUser = (user_id: number, obj: object) => {
  const ws = userConnections.get(user_id);
  if (ws) {
    ws.send(JSON.stringify(obj));
  }
}



app.get('/health', (req: Request, res: Response) => {
  return res.send('Healthy');
});

export const getAllLists = async (user_id: number): Promise<EnhancedListWithItems[]> => {
  const myLists = await db.select().from(SHOPPING_LIST_WITH_ITEMS)
    .where(eq(SHOPPING_LIST_WITH_ITEMS.user_id, user_id));
  const sharedListIds = await db.select({shopping_list_id: SHOPPING_LIST_SHARED_USER.shopping_list_id})
    .from(SHOPPING_LIST_SHARED_USER)
    .where(eq(SHOPPING_LIST_SHARED_USER.user_id, user_id));

  const sharedLists = []
  for (const sharedListId of sharedListIds) {
    const sharedList = await db.select().from(SHOPPING_LIST_WITH_ITEMS)
      .where(eq(SHOPPING_LIST_WITH_ITEMS.id, sharedListId.shopping_list_id!));
    const enhanced = sharedList[0] as EnhancedListWithItems;
    const subscribed = await db.select().from(LIST_NOTIFICATION_SUBSCRIPTION)
      .where(
        and(
          eq(LIST_NOTIFICATION_SUBSCRIPTION.shopping_list_id, sharedListId.shopping_list_id!), 
          eq(LIST_NOTIFICATION_SUBSCRIPTION.user_id, user_id)
        )
      );
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
// GETS
app.get('/lists', async (req: Request, res: Response) => {
  const user_id = parseInt(req.query.user_id as string);
  const lists = await getAllLists(user_id);
  return res.send(lists);
});
app.get('/lists/:id/items', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const listWithItems = await db.select().from(SHOPPING_LIST_WITH_ITEMS).where(eq(SHOPPING_LISTS.id, id));
  return res.send(listWithItems);
});
app.get('/notifications/:userId', async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const notifications = await db.select().from(NOTIFICATIONS).where(eq(NOTIFICATIONS.user_id, userId));
  return res.send(notifications);
});
app.get('/suggestions', async (req: Request, res: Response) => {
  const str = req.query.str as string;
  const commonItems = await db.select().from(COMMON_ITEMS).where(ilike(COMMON_ITEMS.name, `%${str}%`));
  return res.send(commonItems);
})
app.get('/guest', async (req: Request, res: Response) => {
  const timestamp = new Date().toISOString();
  const user = await db.insert(APP_USERS).values({ name: `Guest ${timestamp}`, email: `foo@localhost`, password: 'password' }).returning()
  return res.send(user);
})


// POSTS

app.post('/lists/:id/items', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const name = req.body.name;
  const user_id = req.body.user_id;
  const result = await db.insert(SHOPPING_LIST_ITEMS).values({ name, shoppingListId: id, created_by: user_id }).returning({insertId: SHOPPING_LIST_ITEMS.id})
  sendMessageToClients({
    action: 'addItemToList',
    listId: id,
    itemId: result[0].insertId,
    name
  });
  return res.send('Item Created');
});

app.post('/lists/:listId/share', async (req: Request, res: Response) => {
  const listId = parseInt(req.params.listId);
  const username = req.body.username;
  const user = await db.select().from(APP_USERS).where(eq(APP_USERS.name, username));
  if (user.length === 0) {
    return res.status(400).send('User not found');
  }
  await db.insert(SHOPPING_LIST_SHARED_USER).values({ shopping_list_id: listId, user_id: user[0].id }).execute();
  await db.update(SHOPPING_LISTS).set({ shared: true }).where(eq(SHOPPING_LISTS.id, listId)).execute();
  return res.send('List Shared');
});

app.post('/login', async (req: Request, res: Response) => {
  const username = req.body.username;
  const password = req.body.password;
  console.log(username, password);
  const user = await db.select().from(APP_USERS).where(eq(APP_USERS.name, username));
  if (user.length === 0) {
    return res.status(400).send('User not found');
  }
  if (user[0].password !== password) {
    return res.status(400).send('Password is incorrect');
  }
  return res.send(user[0]);
})

app.post('/lists', async (req: Request, res: Response) => {
  const name = req.body.name;
  const user_id = req.body.user_id;
  if (!name) {
    return res.status(400).send('Name is required');
  }
  const result = await db.insert(SHOPPING_LISTS).values({name, user_id}).returning({insertId: SHOPPING_LISTS.id})
  sendMessageToClients({
    action: 'addList',
    list: { name, id: result[0].insertId, items: [], user_id}
  });
  return res.send('List Created');
});

app.post('/lists/:listId/subscribe', async (req: Request, res: Response) => {
  const listId = parseInt(req.params.listId);
  const userId = req.body.userId;
  await db.insert(LIST_NOTIFICATION_SUBSCRIPTION).values({ shopping_list_id: listId, user_id: userId }).execute();
  sendMessageToUser(userId, {
    action: 'subscribeToList',
    id: listId
  });
  return res.send('Subscribed');
});

app.post('/lists/:listId/unsubscribe', async (req: Request, res: Response) => {
  const listId = parseInt(req.params.listId);
  const userId = req.body.userId;
  await db.delete(LIST_NOTIFICATION_SUBSCRIPTION).where(and(eq(LIST_NOTIFICATION_SUBSCRIPTION.shopping_list_id, listId), eq(LIST_NOTIFICATION_SUBSCRIPTION.user_id, userId))).execute();
  sendMessageToUser(userId, {
    action: 'unsubscribeFromList',
    id: listId
  });
  return res.send('Unsubscribed');
});


// PATCHES
app.patch('/lists/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const newName = req.body.name;
  await db.update(SHOPPING_LISTS).set({ name: newName }).where(eq(SHOPPING_LISTS.id, id)).execute();
  sendMessageToClients({
    action: 'renameList',
    id,
    name: newName
  });
  return res.send('List Updated');
});

app.patch('/lists/:listId/items/:itemId', async (req: Request, res: Response) => {
  const itemId = parseInt(req.params.itemId);
  const listId = parseInt(req.params.listId);
  const newName = req.body.name;
  await db.update(SHOPPING_LIST_ITEMS).set({ name: newName }).where(eq(SHOPPING_LIST_ITEMS.id, itemId)).execute();
  sendMessageToClients({
    action: 'renameItem',
    listId,
    itemId,
    name: newName
  });
  return res.send('Item Updated');
});

// DELETES

app.delete('/lists/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await db.execute(sql`CALL delete_shopping_list(${id})`)
  sendMessageToClients({
    action: 'deleteList',
    id
  });
  return res.send('List Deleted');
});
app.delete('/lists/:listId/items/:itemId', async (req: Request, res: Response) => {
  const itemId = parseInt(req.params.itemId);
  const listId = parseInt(req.params.listId);
  await db.delete(SHOPPING_LIST_ITEMS).where(eq(SHOPPING_LIST_ITEMS.id, itemId)).execute();
  sendMessageToClients({
    action: 'deleteItemFromList',
    itemId,
    listId
  });
  return res.send('Item Deleted');
});
app.delete('/notifications/:notificationId', async (req: Request, res: Response) => {
  const notificationId = parseInt(req.params.notificationId);
  await db.delete(NOTIFICATIONS).where(eq(NOTIFICATIONS.id, notificationId)).execute();
  return res.send('Notification Deleted');
});


const server = app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});

const userConnections = new Map<number, WebSocket>();

const wss = new WebSocket.Server({ server });
wss.on('connection', (ws: WebSocket, req) => {
  const user_id = parseInt(req.url?.split('=')[1] ?? '0');
  userConnections.set(user_id, ws);
  ws.on('message', (message: string) => {
    console.log('received: %s', message);
  });
});