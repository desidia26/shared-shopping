import React, { createContext, useState, useEffect, useMemo } from "react";
import { ListWithItems } from "../constants/types";
import { getLists } from "../services/api";

interface ListContextProps {
  shoppingLists: ListWithItems[];
}

const ListContext = createContext<ListContextProps>({
  shoppingLists: [],
} as ListContextProps);

const ListProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [shoppingLists, setShoppingLists] = useState<ListWithItems[]>([]);

  useEffect(() => {
    (async () => {
      const lists = await getLists();
      setShoppingLists(lists);
    })();
  }, []);
  const value = useMemo(() => ({ shoppingLists }), [shoppingLists]);

  return <ListContext.Provider value={value}>{children}</ListContext.Provider>;
};

export { ListContext, ListProvider };
