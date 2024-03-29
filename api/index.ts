
import express, {Request, Response , Application } from 'express';
import dotenv from 'dotenv';
import {SHOPPING_LISTS, SHOPPING_LIST_ITEMS, db, getAllLists, getListWithItems} from './dal/db'
import { eq } from 'drizzle-orm';
import WebSocket from 'ws';
//For env File 
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

app.post('/lists', async (req: Request, res: Response) => {
  const name = req.body.name;
  if (!name) {
    return res.status(400).send('Name is required');
  }
  const result = await db.insert(SHOPPING_LISTS).values({name}).returning({insertId: SHOPPING_LISTS.id})
  sendMessageToClients({
    action: 'addList',
    list: { name, id: result[0].insertId }
  });
  return res.send('List Created');
});

app.get('/lists', async (req: Request, res: Response) => {
  const lists = await getAllLists();
  return res.send(lists);
});

app.get('/lists/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const list = await getListWithItems(id)
  return res.send(list);
});

app.patch('/lists/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const newName = req.body.name;
  await db.update(SHOPPING_LISTS).set({ name: newName }).where(eq(SHOPPING_LISTS.id, id)).execute();
  return res.send('List Updated');
});

app.delete('/lists/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await db.delete(SHOPPING_LISTS).where(eq(SHOPPING_LISTS.id, id)).execute();
  sendMessageToClients({
    action: 'deleteList',
    id
  });
  return res.send('List Deleted');
});

app.post('/lists/:id/items', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const name = req.body.name;
  const result = await db.insert(SHOPPING_LIST_ITEMS).values({ name, shoppingListId: id }).returning({insertId: SHOPPING_LIST_ITEMS.id})
  sendMessageToClients({
    action: 'addItemToList',
    listId: id,
    itemId: result[0].insertId,
    name
  });
  return res.send('Item Created');
});

app.get('/lists/:id/items', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const listWithItems = await getListWithItems(id)
  return res.send(listWithItems);
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

const server = app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (message: string) => {
    console.log('received: %s', message);
  });
});