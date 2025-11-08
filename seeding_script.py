"""
seeding_script.py

Generates CSV files for Project 2 Phase 2 seeding for a team size of 5:
 - 52 weeks of sales history (~1 year)
 - target total sales ≈ $1,000,000 (adjustable)
 - 2 peak days
 - delta_menu_items items (uses first N of base_menu)
 - creates customers, employees, categories, ingredient_categories,
   menu_items (with category_id), ingredients (with ingredient_category_id),
   recipes, orders, order_items
"""

import csv
import os
import random
from datetime import datetime, timedelta

# ----------------------------
# CONFIG
# ----------------------------
alpha_weeks = 52              # α: weeks of history
beta_millions = 1.0           # β: target total sales in millions (~1.0 => $1,000,000)
phi_peaks = 2                 # φ: number of peak days
delta_menu_items = 32         # δ: number of distinct menu items to export (first N from base_menu)
customers_count = 300         # number of customers
employees_count = 10          # employees
avg_order_value = 7.5         # average order value (used to estimate # orders)
tax_rate = 0.07               # example tax rate
start_hour = 8                # store opens at 8am
end_hour = 21                 # store closes at 9pm
output_dir = "csv_data"
seed = 12345                  # deterministic generation
scale_factor = 1.0            # reduce to e.g., 0.1 for fast tests (10% of data)

random.seed(seed)

# Derived settings
total_target_sales = beta_millions * 1_000_000.0
estimated_total_orders = int(total_target_sales / avg_order_value)
estimated_total_orders = max(1, int(estimated_total_orders * scale_factor))

today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
start_date = (today - timedelta(weeks=alpha_weeks)).replace(hour=0, minute=0, second=0, microsecond=0)
end_date = today + timedelta(days=1) - timedelta(seconds=1)

total_days = (end_date.date() - start_date.date()).days + 1
dates = [start_date + timedelta(days=i) for i in range(total_days)]

# Choose phi peak days via offsets
peak_offsets = [14, 14 + 182]
peak_days = []
for offset in peak_offsets[:phi_peaks]:
    index = min(max(0, offset), total_days - 1)
    peak_days.append(dates[index].date())

# Make output dir
os.makedirs(output_dir, exist_ok=True)

# ----------------------------
# Helpers
# ----------------------------
def write_csv(path, fieldnames, rows):
    with open(path, "w", newline='', encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)

# ----------------------------
# Static seed data
# ----------------------------
first_names = ["Alex","Taylor","Jordan","Morgan","Casey","Riley","Sky","Sam","Jamie","Avery",
               "Chris","Pat","Robin","Drew","Devon","Parker","Quinn","Reese","Shawn","Lee",
               "Noah","Liam","Emma","Olivia","Sophia","Isabella","Mia"]
last_names = ["Chen","Lee","Wong","Park","Kim","Garcia","Smith","Nguyen","Brown","Johnson",
              "Martinez","Davis","Clark","Lopez","Wilson","Hernandez","Lewis","Robinson","Walker","Young"]

# Full list; exporter will slice first delta_menu_items
base_menu = [
    "Classic Milk Tea","Taro Milk Tea","Matcha Pearl Milk Tea", "Matcha Fresh Milk",
    "Matcha Ice Blended", "Strawberry Matcha Fresh Milk",
    "Brown Sugar Boba","Thai Tea","Honeydew Milk Tea", "Rose Milk Tea","Oolong Tea","Wintermelon Milk Tea",
    "Strawberry Smoothie","Mango Slush", "Chocolate Milk Tea","Vanilla Milk Tea",
    "Coffee Milk Tea","Lychee Jasmine", "Pineapple Green Tea", "Caramel Milk Tea",
    "Hazelnut Latte","Passion Fruit Tea","Peach Oolong",
    "Oreo w/ Pearl", "Taro w/ Pudding", "Thai Tea w/ Pearl", "Coffee w/ Pearl",
    "Gingerbread Shake", "Eggnog", "Peppermint Mocha", "Classic Tea", "Honey Tea"
]

# === Menu categories ===
menu_categories = [
    "Milk Tea", "Fresh Brew", "Fruity Beverages", "Special Items",
    "Matcha Series", "Ice Blended", "Misc" 
]

# Map drink -> category
item_category_map = {
    "Classic Milk Tea": "Milk Tea",
    "Taro Milk Tea": "Milk Tea",
    "Matcha Pearl Milk Tea": "Matcha Series",
    "Matcha Fresh Milk": "Matcha Series",
    "Matcha Ice Blended": "Matcha Series",
    "Strawberry Matcha Fresh Milk": "Matcha Series",
    "Brown Sugar Boba": "Milk Tea",
    "Thai Tea": "Milk Tea",
    "Honeydew Milk Tea": "Milk Tea",
    "Rose Milk Tea": "Milk Tea",
    "Oolong Tea": "Fresh Brew",
    "Wintermelon Milk Tea": "Milk Tea",
    "Strawberry Smoothie": "Ice Blended",
    "Mango Slush": "Ice Blended",
    "Chocolate Milk Tea": "Milk Tea",
    "Vanilla Milk Tea": "Milk Tea",
    "Coffee Milk Tea": "Milk Tea",
    "Lychee Jasmine": "Fruity Beverages",
    "Pineapple Green Tea": "Fruity Beverages",
    "Caramel Milk Tea": "Milk Tea",
    "Hazelnut Latte": "Milk Tea",
    "Passion Fruit Tea": "Fruity Beverages",
    "Peach Oolong": "Fruity Beverages",
    "Oreo w/ Pearl": "Ice Blended",
    "Taro w/ Pudding": "Ice Blended",
    "Thai Tea w/ Pearl": "Ice Blended",
    "Coffee w/ Pearl": "Ice Blended",
    "Gingerbread Shake": "Special Items",
    "Eggnog": "Special Items",
    "Peppermint Mocha": "Special Items",
    "Classic Tea": "Fresh Brew",
    "Honey Tea": "Fresh Brew"
}

ingredient_categories = [
    "Sizes", "Toppings", "Milk", "Flavoring", "Teas",
    "Packaging", "Ice Level", "Sweetness Level", "Bases"
]

ingredient_category_map = {
    "Small Cup": "Sizes",
    "Medium Cup": "Sizes",
    "Large Cup": "Sizes",

    "Lid": "Packaging",
    "Straw": "Packaging",
    "Napkin": "Packaging",
    "To-go Box": "Packaging",
    "Bag": "Packaging",

    "Tapioca Pearls": "Toppings",
    "Lychee Jelly": "Toppings",
    "Coffee Jelly": "Toppings",
    "Honey Jelly": "Toppings",
    "Pudding": "Toppings",

    "Black Tea": "Teas",
    "Green Tea": "Teas",
    "Oolong Tea": "Teas",

    "2% Milk": "Milk",
    "Whole Milk": "Milk",
    "Non-Dairy Milk": "Milk",

    "Taro Powder": "Flavoring",
    "Brown Sugar": "Flavoring",
    "Chocolate Syrup": "Flavoring",
    "Vanilla Syrup": "Flavoring",
    "Caramel": "Flavoring",
    "Strawberry Puree": "Flavoring",
    "Mango Puree": "Flavoring",
    "Matcha Powder": "Flavoring",
    "Coffee": "Flavoring",

    "Regular Ice": "Ice Level",
    "Less Ice": "Ice Level",
    "No Ice": "Ice Level",
    "100% Sugar": "Sweetness Level",
    "75% Sugar": "Sweetness Level",
    "50% Sugar": "Sweetness Level",
    "25% Sugar": "Sweetness Level",
    "0% Sugar": "Sweetness Level",
}

# ----------------------------
# Categories CSVs (NEW)
# ----------------------------
# Menu categories
category_rows = [{"category_id": i+1, "name": name} for i, name in enumerate(menu_categories)]
write_csv(os.path.join(output_dir, "categories.csv"), ["category_id", "name"], category_rows)
category_name_to_id = {r["name"]: r["category_id"] for r in category_rows}
print(f"categories.csv: {len(category_rows)} rows")

# Ingredient categories
ing_cat_rows = [{"ingredient_category_id": i+1, "name": name} for i, name in enumerate(ingredient_categories)]
write_csv(os.path.join(output_dir, "ingredient_categories.csv"), ["ingredient_category_id", "name"], ing_cat_rows)
ingredient_category_name_to_id = {r["name"]: r["ingredient_category_id"] for r in ing_cat_rows}
print(f"ingredient_categories.csv: {len(ing_cat_rows)} rows")

# ----------------------------
# Generate Customers
# ----------------------------
customers = []
for i in range(1, customers_count + 1):
    first_name = random.choice(first_names)
    last_name = random.choice(last_names)
    email = f"{first_name.lower()}_{last_name.lower()}{i}@gmail.com"
    customers.append({
        "customer_id": i,
        "first_name": first_name,
        "last_name": last_name,
        "email": email
    })

write_csv(os.path.join(output_dir, "customers.csv"),
          ["customer_id", "first_name", "last_name", "email"],
          customers)
print(f"customers.csv: {len(customers)} rows")

# ----------------------------
# Generate Employees
# ----------------------------
employees = []
for i in range(1, employees_count + 1):
    first_name = random.choice(first_names)
    last_name = random.choice(last_names)
    hours_worked = round(random.uniform(20, 40) * alpha_weeks)
    items_sold = random.randint(500, 4000) if scale_factor >= 1.0 else random.randint(50, 400)
    total_sales = round(items_sold * avg_order_value * random.uniform(0.8, 1.2))
    isManager = (i == 1)
    employees.append({
        "employee_id": i,
        "first_name": first_name,
        "last_name": last_name,
        "hours_worked": hours_worked,
        "items_sold": items_sold,
        "total_sales": total_sales,
        "isManager" : isManager,
    })

write_csv(os.path.join(output_dir, "employees.csv"),
          ["employee_id", "first_name", "last_name", "hours_worked", "items_sold", "total_sales", "isManager"],
          employees)
print(f"employees.csv: {len(employees)} rows")

# ----------------------------
# Menu Items (UPDATED with category_id)
# ----------------------------
menu_items = []
default_item_category = "Misc"
export_menu = base_menu[:delta_menu_items]  # respect delta_menu_items

for i, name in enumerate(export_menu, start=1):
    sale_price = round(random.uniform(3.5, 7.0), 2)
    size_options = random.choice(["S,M,L", "M,L"])
    in_stock = 1
    photo = f"menu_{i}.jpg"

    cat_name = item_category_map.get(name, default_item_category)
    cat_id = category_name_to_id.get(cat_name, category_name_to_id[default_item_category])

    menu_items.append({
        "menu_item_id": i,
        "name": name,
        "sale_price": sale_price,
        "size_options": size_options,
        "in_stock": in_stock,
        "photo": photo,
        "category_id": cat_id
    })

write_csv(os.path.join(output_dir, "menu_items.csv"),
          ["menu_item_id", "name", "sale_price", "in_stock", "size_options", "photo", "category_id"],
          menu_items)
print(f"menu_items.csv: {len(menu_items)} rows")

# ----------------------------
# Ingredients (UPDATED with ingredient_category_id)
# ----------------------------
packaging = ["Small Cup","Medium Cup","Large Cup","Lid","Straw","Napkin","To-go Box","Bag"]
core_ingredients = [
    "Regular Ice", "Less Ice", "No Ice", "100% Sugar", "75% Sugar", "50% Sugar", "25% Sugar", "0% Sugar",
    "Tapioca Pearls", "Lychee Jelly", "Coffee Jelly", "Honey Jelly", "Pudding",
    "Black Tea", "Green Tea","Oolong Tea",
    "2% Milk", "Whole Milk", "Non-Dairy Milk",
    "Taro Powder", "Brown Sugar", "Chocolate Syrup", "Vanilla Syrup", "Caramel",
    "Strawberry Puree", "Mango Puree","Matcha Powder","Coffee"
]
ingredient_names = core_ingredients + packaging

ingredients = []
for i, name in enumerate(ingredient_names, start=1):
    ingredient_count = random.randint(200, 5000) if scale_factor >= 1.0 else random.randint(20, 500)
    expiration = (datetime.now() + timedelta(days=random.randint(30, 365))).date().isoformat()
    per_unit_cost = round(random.uniform(0.01, 2.00), 2)
    vendor_name = f"Vendor_{random.randint(1,8)}"

    cat_name = ingredient_category_map.get(name, "Bases")
    ing_cat_id = ingredient_category_name_to_id.get(cat_name, ingredient_category_name_to_id["Bases"])

    ingredients.append({
        "ingredient_id": i,
        "ingredient_name": name,
        "ingredient_count": ingredient_count,
        "expiration_date": expiration,
        "per_unit_cost": per_unit_cost,
        "vendor_name": vendor_name,
        "ingredient_category_id": ing_cat_id
    })

write_csv(os.path.join(output_dir, "ingredients.csv"),
          ["ingredient_id", "ingredient_name", "ingredient_count", "expiration_date",
           "per_unit_cost", "vendor_name", "ingredient_category_id"],
          ingredients)
print(f"ingredients.csv: {len(ingredients)} rows")

# ----------------------------
# Recipes: map menu_item -> multiple ingredients (3-6 each)
# ----------------------------
recipes = []
ingredient_count_total = len(ingredients)
for m in menu_items:
    used = set()
    n_ing = random.randint(3, 6)
    attempts = 0
    while len(used) < n_ing and attempts < n_ing * 3:
        ing_id = random.randint(1, ingredient_count_total)
        used.add(ing_id)
        attempts += 1
    for ing_id in used:
        recipes.append({
            "menu_item_id": m["menu_item_id"],
            "ingredient_id": ing_id,
        })

write_csv(os.path.join(output_dir, "recipes.csv"),
          ["menu_item_id", "ingredient_id"], recipes)
print(f"recipes.csv: {len(recipes)} rows")

# ----------------------------
# Orders & OrderItems generation
# ----------------------------
day_weights = []
for d in dates:
    w = 1.0
    if d.date() in peak_days:
        w = 4.0
    day_weights.append(w)

total_weight = sum(day_weights)
orders_per_day = [w / total_weight * estimated_total_orders for w in day_weights]

orders_per_day_int = [int(x) for x in orders_per_day]
difference = estimated_total_orders - sum(orders_per_day_int)
i_cursor = 0
while difference > 0:
    orders_per_day_int[i_cursor % len(orders_per_day_int)] += 1
    i_cursor += 1
    difference -= 1

orders = []
order_items = []
order_id_counter = 1

for day_idx, day in enumerate(dates):
    count = orders_per_day_int[day_idx]
    for _ in range(count):
        cust = random.randint(1, customers_count)
        cashier = random.randint(1, employees_count)

        hour = random.randint(start_hour, end_hour)
        minute = random.randint(0, 59)
        second = random.randint(0, 59)

        order_date = day.date()
        order_time_only = f"{hour:02d}:{minute:02d}:{second:02d}"
        order_timestamp = f"{order_date} {order_time_only}"

        num_items = random.choices([1,2,3], weights=[0.5,0.35,0.15], k=1)[0]
        chosen_items = random.choices(menu_items, k=num_items)
        transaction_total = 0.0

        for mi in chosen_items:
            qty = random.choices([1,2], weights=[0.9,0.1], k=1)[0]
            price = mi["sale_price"]
            subtotal = round(price * qty, 2)
            transaction_total += subtotal
            order_items.append({
                "order_id": order_id_counter,
                "menu_item_id": mi["menu_item_id"],
                "quantity": qty,
                "subtotal": subtotal
            })

        tip = round(random.uniform(0.0, 3.0), 2)
        tax = round(transaction_total * tax_rate, 2)
        transaction_total = round(transaction_total, 2)

        orders.append({
            "order_time": order_timestamp,
            "transaction_total": transaction_total,
            "tax": tax,
            "tip": tip,
            "customer_id": cust,
            "cashier_id": cashier,
        })

        order_id_counter += 1

write_csv(os.path.join(output_dir, "orders.csv"),
          ["order_time","transaction_total","tax","tip","customer_id","cashier_id"],
          orders)
write_csv(os.path.join(output_dir, "order_items.csv"),
          ["order_id","menu_item_id","quantity","subtotal"],
          order_items)

print(f"orders.csv: {len(orders)} rows")
print(f"order_items.csv: {len(order_items)} rows")

# ----------------------------
# Summary stats
# ----------------------------
total_sales_generated = sum(o["transaction_total"] for o in orders)
print("--------------------------------------------------")
print(f"Generated orders: {len(orders)}")
print(f"Generated order_items: {len(order_items)}")
print(f"Approx total sales (sum of transaction_total): ${total_sales_generated:,.2f}")
print(f"Target approx total sales: ${total_target_sales:,.2f} (scale_factor={scale_factor})")
print(f"Date range: {start_date.date()} to {end_date.date()}")
print(f"Peak days: {', '.join([d.isoformat() for d in peak_days])}")
print("CSV files written to:", output_dir)
print("--------------------------------------------------")
