CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50),
  email VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS shopping_list (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  user_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  shared_with INT[]
);

CREATE TABLE IF NOT EXISTS shopping_list_items (
  id SERIAL PRIMARY KEY,
  shopping_list_id INT,
  name VARCHAR(100),
  FOREIGN KEY (shopping_list_id) REFERENCES shopping_list(id)
);

INSERT INTO users (name, email) VALUES ('John Doe', 'notreal@no.q');
INSERT INTO shopping_list (name) VALUES ('My Groceries');
INSERT INTO shopping_list_items (shopping_list_id, name) VALUES (1, 'Milk');
INSERT INTO shopping_list_items (shopping_list_id, name) VALUES (1, 'Eggs');
INSERT INTO shopping_list_items (shopping_list_id, name) VALUES (1, 'Bread');
INSERT INTO shopping_list_items (shopping_list_id, name) VALUES (1, 'Butter');

INSERT INTO shopping_list (name) VALUES ('My Hardware Store');
INSERT INTO shopping_list_items (shopping_list_id, name) VALUES (2, 'Nails');
INSERT INTO shopping_list_items (shopping_list_id, name) VALUES (2, 'Screws');
INSERT INTO shopping_list_items (shopping_list_id, name) VALUES (2, 'Hammer');
INSERT INTO shopping_list_items (shopping_list_id, name) VALUES (2, 'Saw');
