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

CREATE OR REPLACE FUNCTION delete_guest_users() RETURNS void AS $$
BEGIN
    DELETE FROM list_notification_subscription WHERE user_id IN (SELECT id FROM app_user WHERE name LIKE 'Guest%');
    DELETE FROM notification WHERE user_id IN (SELECT id FROM app_user WHERE name LIKE 'Guest%');
    DELETE FROM shopping_list_shared_user WHERE user_id IN (SELECT id FROM app_user WHERE name LIKE 'Guest%');
    DELETE FROM shopping_list WHERE user_id IN (SELECT id FROM app_user WHERE name LIKE 'Guest%');
    DELETE FROM app_user WHERE name LIKE 'Guest%';
END;
$$ LANGUAGE plpgsql;

-- INSERT INTO app_user (name, email, password) VALUES ('admin', 'asd@asd.asd', 'admin');
-- INSERT INTO app_user (name, email, password) VALUES ('user', 'qwe@qwe.qwe', 'user');




