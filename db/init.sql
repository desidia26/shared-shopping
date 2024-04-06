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
  shopping_list_id INT,
  name VARCHAR(100),
  quantity INT,
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shopping_list_id) REFERENCES shopping_list(id)
);

