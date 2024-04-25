CREATE TABLE IF NOT EXISTS app_user (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50),
  email VARCHAR(100),
  password VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shopping_list (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  description TEXT,
  shared BOOLEAN DEFAULT FALSE,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES app_user(id)
);

CREATE TABLE IF NOT EXISTS shopping_list_shared_user (
  shopping_list_id INT,
  user_id INT,
  PRIMARY KEY (shopping_list_id, user_id),
  FOREIGN KEY (shopping_list_id) REFERENCES shopping_list(id),
  FOREIGN KEY (user_id) REFERENCES app_user(id)
);

CREATE TABLE IF NOT EXISTS shopping_list_item (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  shopping_list_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shopping_list_id) REFERENCES shopping_list(id)
);

CREATE TABLE IF NOT EXISTS list_notification_subscription (
  id SERIAL PRIMARY KEY,
  user_id INT,
  shopping_list_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES app_user(id),
  FOREIGN KEY (shopping_list_id) REFERENCES shopping_list(id)
);


CREATE TABLE IF NOT EXISTS notification (
  id SERIAL PRIMARY KEY,
  user_id INT,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES app_user(id)
);

CREATE OR REPLACE VIEW shopping_list_with_items AS
  SELECT sl.id,
    sl.name,
    sl.description,
    sl.shared,
    sl.user_id,
    sl.created_at,
    sl.updated_at,
    json_agg(json_build_object('id', sli.id, 'name', sli.name, 'created_at', sli.created_at, 'updated_at', sli.updated_at)) AS items
    FROM shopping_list sl
      LEFT JOIN shopping_list_item sli ON sl.id = sli.shopping_list_id
  GROUP BY sl.id;

CREATE OR REPLACE FUNCTION delete_guest_users() RETURNS void AS $$
BEGIN
    DELETE FROM list_notification_subscription WHERE user_id IN (SELECT id FROM app_user WHERE name LIKE 'Guest%');
    DELETE FROM notification WHERE user_id IN (SELECT id FROM app_user WHERE name LIKE 'Guest%');
    DELETE FROM shopping_list_shared_user WHERE user_id IN (SELECT id FROM app_user WHERE name LIKE 'Guest%');
    DELETE FROM shopping_list_item WHERE shopping_list_id IN (SELECT id FROM shopping_list WHERE user_id IN (SELECT id FROM app_user WHERE name LIKE 'Guest%'));
    DELETE FROM shopping_list WHERE user_id IN (SELECT id FROM app_user WHERE name LIKE 'Guest%');
    DELETE FROM app_user WHERE name LIKE 'Guest%';
END;
$$ LANGUAGE plpgsql;


-- Create a function that inserts a notification for all users subscribed to a list when an item is added
CREATE OR REPLACE FUNCTION notify_users_on_item_added() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification (user_id, message)
  SELECT user_id, 'An item was added to a list you are subscribed to.'
  FROM list_notification_subscription
  WHERE shopping_list_id = NEW.shopping_list_id AND user_id != NEW.created_by;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS item_added ON shopping_list_item;

-- Create a trigger that calls the above function whenever a new item is inserted into the shopping_list_item table
CREATE TRIGGER item_added
AFTER INSERT ON shopping_list_item
FOR EACH ROW
EXECUTE FUNCTION notify_users_on_item_added();

INSERT INTO app_user (name, email, password) VALUES ('admin', 'asd@asd.asd', 'admin');
INSERT INTO app_user (name, email, password) VALUES ('user', 'qwe@qwe.qwe', 'user');




