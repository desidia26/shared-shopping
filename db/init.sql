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

CREATE OR REPLACE FUNCTION notify_users_on_item_added() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification (user_id, message)
  SELECT lns.user_id, 'Item ' || NEW.name || ' added to list ' || sl.name || ' by ' || (SELECT name FROM app_user WHERE id = NEW.created_by)
  FROM list_notification_subscription lns
  JOIN shopping_list sl ON lns.shopping_list_id = sl.id
  WHERE sl.id = NEW.shopping_list_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION notify_users_on_item_removed() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification (user_id, message)
  SELECT lns.user_id, 'Item ' || OLD.name || ' removed from list ' || sl.name || ' by ' || (SELECT name FROM app_user WHERE id = OLD.created_by)
  FROM list_notification_subscription lns
  JOIN shopping_list sl ON lns.shopping_list_id = sl.id
  WHERE sl.id = OLD.shopping_list_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS item_added ON shopping_list_item;
DROP TRIGGER IF EXISTS item_removed ON shopping_list_item;

CREATE TRIGGER item_removed
AFTER DELETE ON shopping_list_item
FOR EACH ROW
EXECUTE FUNCTION notify_users_on_item_removed();

CREATE TRIGGER item_added
AFTER INSERT ON shopping_list_item
FOR EACH ROW
EXECUTE FUNCTION notify_users_on_item_added();

INSERT INTO app_user (name, email, password) VALUES ('admin', 'asd@asd.asd', 'admin');
INSERT INTO app_user (name, email, password) VALUES ('user', 'qwe@qwe.qwe', 'user');




