
// import { useState, useEffect } from 'react';
// import CashierNavbar from '../components/CashierNavbar';

// export default function Orders() {
//   const [categories, setCategories] = useState<any[]>([]);
//   const [items, setItems] = useState<any[]>([]);
//   const [ingredients, setIngredients] = useState<any[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
//   const [cart, setCart] = useState<any[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [_employeeId] = useState(1);

//   const API_URL = '/api';

//   // Load categories
//   useEffect(() => {
//     const loadCategories = async () => {
//       try {
//         const res = await fetch(`${API_URL}/categories`);
//         if (!res.ok) throw new Error('Failed to fetch categories');
//         const data = await res.json();
//         setCategories(data);
//         if (data.length > 0) setSelectedCategory(data[0].category_id);
//       } catch (err) {
//         console.error('Error fetching categories:', err);
//         setError('Could not load categories.');
//       }
//     };
//     loadCategories();
//   }, []);

//   // Load items
//   useEffect(() => {
//     const loadItems = async () => {
//       try {
//         const res = await fetch(`${API_URL}/items`);
//         if (!res.ok) throw new Error('Failed to fetch items');
//         const data = await res.json();
//         setItems(data);
//       } catch (err) {
//         console.error('Error fetching items:', err);
//         setError('Could not load items.');
//       }
//     };
//     loadItems();
//   }, []);

//   // Load ingredients
//   useEffect(() => {
//     const loadIngredients = async () => {
//       try {
//         const res = await fetch(`${API_URL}/ingredients`);
//         if (!res.ok) throw new Error('Failed to fetch ingredients');
//         const data = await res.json();
//         setIngredients(data);
//       } catch (err) {
//         console.error('Error fetching ingredients:', err);
//         setError('Could not load ingredients.');
//       }
//     };
//     loadIngredients();
//   }, []);

//   if (error) {
//     return (
//       <div className="error-screen">
//         <CashierNavbar />
//         <div className="error-container" style={{ textAlign: 'center', marginTop: '3rem' }}>
//           <h2>Something went wrong</h2>
//           <p>{error}</p>
//           <button onClick={() => window.location.reload()} className="btn">
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Group ingredients by ingredient_category_name, sorted
//   const groupedIngredients: Record<string, any[]> = {};
//   ingredients.forEach((ingredient) => {
//     const catName = ingredient.ingredient_category_name || 'Uncategorized';
//     if (!groupedIngredients[catName]) groupedIngredients[catName] = [];
//     groupedIngredients[catName].push(ingredient);
//   });

//   // Sort ingredients within each category alphabetically
//   Object.keys(groupedIngredients).forEach((catName) => {
//     groupedIngredients[catName].sort((a, b) => a.ingredient_name.localeCompare(b.ingredient_name));
//   });

//   // Sorted list of category names
//   const sortedCategoryNames = Object.keys(groupedIngredients).sort();

//   // Filter items for non-Misc categories
//   let filteredItems: any[] = [];
//   if (selectedCategory && selectedCategory !== 7) {
//     filteredItems = items.filter((item) => item.category_id === selectedCategory);
//   }

//   const addToCart = (item: any) => {
//     setCart((prev) => [
//       ...prev,
//       { ...item, cart_id: Date.now(), quantity: 1, customization: '' },
//     ]);
//   };

//   const removeFromCart = (cartId: number) => {
//     setCart((prev) => prev.filter((i) => i.cart_id !== cartId));
//   };

//   const subtotal = cart.reduce((sum, i) => sum + (i.item_cost || i.ingredient_cost || 0) * i.quantity, 0);
//   const tax = subtotal * 0.08;
//   const total = subtotal + tax;

//   const selectedCategoryName =
//     categories.find((c) => c.category_id === selectedCategory)?.name || 'Items';

//   return (
//     <div className="orders-layout">
//       {/* Left sidebar */}
//       <div className="sidebar sidebar-left">
//         <h2 className="section-title">Item Categories</h2>
//         <div className="category-list">
//           {categories.map((category) => (
//             <button
//               key={category.category_id}
//               onClick={() => setSelectedCategory(category.category_id)}
//               className={`category-btn ${selectedCategory === category.category_id ? 'active' : ''}`}
//             >
//               {category.name}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Menu items / ingredients section */}
//       <div className="content">
//         <CashierNavbar />
//         <h2 className="section-title">{selectedCategoryName}</h2>

//         {selectedCategory === 7 ? (
//           sortedCategoryNames.map((catName) => (
//             <div key={catName} className="ingredient-group">
//               <h3 className="ingredient-category-title">{catName}</h3>
//               <div className="item-grid">
//                 {groupedIngredients[catName].map((item) => (
//                   <button
//                     key={item.ingredient_id}
//                     onClick={() => addToCart(item)}
//                     className="item-card"
//                   >
//                     <h3 className="item-name">{item.ingredient_name}</h3>
//                     <p className="item-price">${(item.ingredient_cost || 0).toFixed(2)}</p>
//                   </button>
//                 ))}
//               </div>
//             </div>
//           ))
//         ) : filteredItems.length === 0 ? (
//           <p className="empty muted">No items found.</p>
//         ) : (
//           <div className="item-grid">
//             {filteredItems.map((item) => (
//               <button
//                 key={item.item_id}
//                 onClick={() => addToCart(item)}
//                 className="item-card"
//               >
//                 <h3 className="item-name">{item.item_name}</h3>
//                 <p className="item-price">${item.item_cost.toFixed(2)}</p>
//               </button>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Checkout */}
//       <div className="sidebar sidebar-right">
//         <div className="order-top">
//           <h2 className="order-title">Current Order</h2>
//         </div>

//         <div className="order-lines">
//           {cart.length === 0 ? (
//             <p className="empty muted">No items in cart</p>
//           ) : (
//             cart.map((item) => (
//               <div key={item.cart_id} className="order-line">
//                 <div>
//                   <div className="order-line-title">{item.item_name || item.ingredient_name}</div>
//                   <div className="order-line-sub">{item.customization}</div>
//                 </div>
//                 <div className="order-line-amt">
//                   <span className="order-line-total">
//                     ${((item.item_cost || item.ingredient_cost) * item.quantity).toFixed(2)}
//                   </span>
//                   <button
//                     onClick={() => removeFromCart(item.cart_id)}
//                     className="order-line-remove"
//                   >
//                     ×
//                   </button>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>

//         <div className="totals-card">
//           <div className="totals-row">
//             <span>Subtotal</span>
//             <span>${subtotal.toFixed(2)}</span>
//           </div>
//           <div className="totals-row">
//             <span>Tax</span>
//             <span>${tax.toFixed(2)}</span>
//           </div>
//           <div className="totals-row totals-row-total">
//             <span>Total</span>
//             <span>${total.toFixed(2)}</span>
//           </div>
//         </div>

//         <button
//           disabled={cart.length === 0}
//           className="btn btn-checkout"
//         >
//           Checkout
//         </button>
//       </div>
//     </div>
//   );
// }



import { useState, useEffect } from 'react';
import CashierNavbar from '../components/CashierNavbar';

export default function Orders() {
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [ingredientCategories, setIngredientCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const API_URL = '/api';

  // Allowed ingredient categories for misc (from DB)
  const allowedMiscCatIds = [1, 3, 6, 7, 8]; 
  // Sizes, Milk, Packaging, Ice Level, Sweetness Level

  // Load main item categories
  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        if (data.length > 0) setSelectedCategory(data[0].category_id);
      })
      .catch(() => setError("Could not load categories"));
  }, []);

  // Load items
  useEffect(() => {
    fetch(`${API_URL}/items`)
      .then(res => res.json())
      .then(setItems)
      .catch(() => setError("Could not load items"));
  }, []);

  // Load ingredients
  useEffect(() => {
    fetch(`${API_URL}/ingredients`)
      .then(res => res.json())
      .then(setIngredients)
      .catch(() => setError("Could not load ingredients"));
  }, []);

  // Load ingredient categories
  useEffect(() => {
    fetch(`${API_URL}/ingredient-categories`)
      .then(res => res.json())
      .then(setIngredientCategories)
      .catch(() => setError("Could not load ingredient categories"));
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Group ingredients by category name (but only allowed ones when misc)
  const groupedIngredients: Record<string, any[]> = {};

  ingredients.forEach((ing) => {
    const cat = ingredientCategories.find(c => c.category_id === ing.category_id);
    if (!cat) return;

    // If selected misc, only show allowed categories
    if (selectedCategory === 7 && !allowedMiscCatIds.includes(cat.category_id)) {
      return; 
    }

    const catName = cat.name;

    if (!groupedIngredients[catName]) groupedIngredients[catName] = [];
    groupedIngredients[catName].push(ing);
  });

  // Sort category names alphabetically
  const sortedIngredientCategoryNames = Object.keys(groupedIngredients).sort();

  // Filter items normally (when not misc)
  const filteredItems =
    selectedCategory !== 7
      ? items.filter((i) => i.category_id === selectedCategory)
      : [];

  const addToCart = (item: any) => {
    setCart((prev) => [
      ...prev,
      { ...item, cart_id: Date.now(), quantity: 1, customization: '' },
    ]);
  };

  const removeFromCart = (cartId: number) => {
    setCart((prev) => prev.filter((i) => i.cart_id !== cartId));
  };

  const subtotal = cart.reduce(
    (sum, i) => sum + (i.item_cost || i.ingredient_cost || 0) * i.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const selectedCategoryName =
    categories.find((c) => c.category_id === selectedCategory)?.name || 'Items';

  return (
    <div className="orders-layout">
      {/* Left Sidebar */}
      <div className="sidebar sidebar-left">
        <h2 className="section-title">Item Categories</h2>
        <div className="category-list">
          {categories.map((category) => (
            <button
              key={category.category_id}
              onClick={() => setSelectedCategory(category.category_id)}
              className={`category-btn ${
                selectedCategory === category.category_id ? 'active' : ''
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="content">
        <CashierNavbar />
        <h2 className="section-title">{selectedCategoryName}</h2>

        {/* Misc = ingredient categories */}
        {selectedCategory === 7 ? (
          sortedIngredientCategoryNames.map((catName) => (
            <div key={catName} className="ingredient-group">
              <h3 className="ingredient-category-title">{catName}</h3>
              <div className="item-grid">
                {groupedIngredients[catName].map((item) => (
                  <button
                    key={item.ingredient_id}
                    onClick={() => addToCart(item)}
                    className="item-card"
                  >
                    <h3 className="item-name">{item.ingredient_name}</h3>
                    <p className="item-price">
                      ${(item.ingredient_cost || 0).toFixed(2)}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : filteredItems.length === 0 ? (
          <p className="empty muted">No items found.</p>
        ) : (
          <div className="item-grid">
            {filteredItems.map((item) => (
              <button
                key={item.item_id}
                onClick={() => addToCart(item)}
                className="item-card"
              >
                <h3 className="item-name">{item.item_name}</h3>
                <p className="item-price">${item.item_cost.toFixed(2)}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Checkout */}
      <div className="sidebar sidebar-right">
        <h2 className="order-title">Current Order</h2>

        <div className="order-lines">
          {cart.length === 0 ? (
            <p className="empty muted">No items in cart</p>
          ) : (
            cart.map((item) => (
              <div key={item.cart_id} className="order-line">
                <div>
                  <div className="order-line-title">
                    {item.item_name || item.ingredient_name}
                  </div>
                </div>

                <div className="order-line-amt">
                  <span className="order-line-total">
                    ${((item.item_cost || item.ingredient_cost) * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.cart_id)}
                    className="order-line-remove"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="totals-card">
          <div className="totals-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="totals-row">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="totals-row totals-row-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <button disabled={cart.length === 0} className="btn btn-checkout">
          Checkout
        </button>
      </div>
    </div>
  );
}
