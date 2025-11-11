CREATE TABLE Employee (
    employee_ID INT PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    hours_worked INT,
    total_sales INT,
    items_sold INT,
    isManager BOOLEAN
);


CREATE TABLE Customer(
    customer_ID INT PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255)
);


CREATE TABLE Customer_Order(
    order_ID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    time_ordered TIMESTAMP,
    total_cost FLOAT,
    tax FLOAT,
    tip FLOAT,
    customer_ID INT,
    employee_ID INT,
    FOREIGN KEY (customer_ID) REFERENCES Customer(customer_ID),
    FOREIGN KEY (employee_ID) REFERENCES Employee(employee_ID)
);

CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT,
    item_id INT,
    quantity INT,
    subtotal DOUBLE PRECISION,
    FOREIGN KEY (order_id) REFERENCES customer_order(order_id),
    FOREIGN KEY (item_id) REFERENCES item(item_id)
);

-- For menu item categories
CREATE TABLE Item_Category (
  category_id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE Item(
    item_ID INT PRIMARY KEY,
    item_name VARCHAR(255),
    item_cost FLOAT,
    in_stock BOOLEAN,
    size_options VARCHAR(255),
    photo VARCHAR(255),
    seasonal_item BOOLEAN,
    seasonal_item_beginning_time TIMESTAMP,
    seasonal_item_ending_time TIMESTAMP,
    category_id INT REFERENCES Item_Category(category_id)
);

-- For ingredient categories
CREATE TABLE Ingredient_Category (
  category_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE Ingredient(
    ingredient_ID INT PRIMARY KEY,
    ingredient_name VARCHAR(255),
    supply_level INT,
    expiration_date TIMESTAMP,
    ingredient_cost FLOAT,
    vendor VARCHAR(255),
    category_id INT REFERENCES Ingredient_Category(category_id)
);

-- Creating joint table to handle many-to-many relationship between Item and Ingredient
CREATE TABLE Item_Ingredient(
    item_ID INT,
    ingredient_ID INT,
    PRIMARY KEY (item_ID, ingredient_ID),
    FOREIGN KEY (item_ID) REFERENCES Item(item_ID),
    FOREIGN KEY (ingredient_ID) REFERENCES Ingredient(ingredient_ID)
);
