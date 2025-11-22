


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

//   // Group ingredients by ingredient_category_name
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

//   // Only show these ingredient categories in Misc (IDs: 1, 3, 6, 7, 8)
//   const allowedIngredientCategoryIds = [1, 3, 6, 7, 8];
//   const sortedCategoryNames =
//     selectedCategory === 7
//       ? Object.entries(groupedIngredients)
//           .filter(([_, ingList]) => allowedIngredientCategoryIds.includes(ingList[0].category_id))
//           .map(([catName]) => catName)
//           .sort()
//       : Object.keys(groupedIngredients).sort();

//   // Filter items for non-Misc categories
//   let filteredItems: any[] = [];
//   if (selectedCategory && selectedCategory !== 7) {
//     filteredItems = items.filter((item) => item.category_id === selectedCategory);
//   }

//   const addToCart = (item: any) => {
//     // For Misc (category 7), set ingredient_cost to 0
//     const isMisc = selectedCategory === 7;
//     setCart((prev) => [
//       ...prev,
//       {
//         ...item,
//         cart_id: Date.now(),
//         quantity: 1,
//         customization: '',
//         ingredient_cost: isMisc ? 0 : item.ingredient_cost,
//       },
//     ]);
//   };

//   const removeFromCart = (cartId: number) => {
//     setCart((prev) => prev.filter((i) => i.cart_id !== cartId));
//   };

//   const subtotal = cart.reduce(
//     (sum, i) => sum + (i.item_cost || i.ingredient_cost || 0) * i.quantity,
//     0
//   );
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
//                     {/* Hide price entirely for Misc */}
//                     {selectedCategory !== 7 && (
//                       <p className="item-price">${(item.ingredient_cost || 0).toFixed(2)}</p>
//                     )}
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

//         <button disabled={cart.length === 0} className="btn btn-checkout">
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
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [_employeeId] = useState(1);

  const API_URL = '/api';

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/categories`);
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategories(data);
        if (data.length > 0) setSelectedCategory(data[0].category_id);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Could not load categories.');
      }
    };
    loadCategories();
  }, []);

  // Load items
  useEffect(() => {
    const loadItems = async () => {
      try {
        const res = await fetch(`${API_URL}/items`);
        if (!res.ok) throw new Error('Failed to fetch items');
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error('Error fetching items:', err);
        setError('Could not load items.');
      }
    };
    loadItems();
  }, []);

  // Load ingredients
  useEffect(() => {
    const loadIngredients = async () => {
      try {
        const res = await fetch(`${API_URL}/ingredients`);
        if (!res.ok) throw new Error('Failed to fetch ingredients');
        const data = await res.json();
        setIngredients(data);
      } catch (err) {
        console.error('Error fetching ingredients:', err);
        setError('Could not load ingredients.');
      }
    };
    loadIngredients();
  }, []);

  if (error) {
    return (
      <div className="error-screen">
        <CashierNavbar />
        <div className="error-container" style={{ textAlign: 'center', marginTop: '3rem' }}>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Group ingredients by category
  const groupedIngredients: Record<string, any[]> = {};
  ingredients.forEach((ingredient) => {
    const catName = ingredient.ingredient_category_name || 'Uncategorized';
    if (!groupedIngredients[catName]) groupedIngredients[catName] = [];
    groupedIngredients[catName].push(ingredient);
  });

  // Sort ingredients alphabetically
  Object.keys(groupedIngredients).forEach((catName) => {
    groupedIngredients[catName].sort((a, b) => a.ingredient_name.localeCompare(b.ingredient_name));
  });

  // Misc allowed category IDs
  const allowedIngredientCategoryIds = [1, 3, 6, 7, 8]; // Sizes, Milk, Packaging, Ice Level, Sweetness
  const miscSingleSelectIds = [1, 3, 7, 8]; // Sizes, Milk, Ice Level, Sweetness

  const sortedCategoryNames =
    selectedCategory === 7
      ? Object.entries(groupedIngredients)
          .filter(([_, ingList]) => allowedIngredientCategoryIds.includes(ingList[0].category_id))
          .map(([catName]) => catName)
      : Object.keys(groupedIngredients).sort();

  // Track single selections
  const [singleSelections, setSingleSelections] = useState<Record<number, number>>({}); // category_id -> ingredient_id

  // Add to cart
  const addToCart = (ingredient: any) => {
    if (selectedCategory === 7 && miscSingleSelectIds.includes(ingredient.ingredient_category_id)) {
      // Single select: remove previous selection for this category
      setCart((prev) => [
        ...prev.filter(
          (i) =>
            !(
              i.ingredient_category_id === ingredient.ingredient_category_id &&
              miscSingleSelectIds.includes(i.ingredient_category_id)
            )
        ),
        { ...ingredient, cart_id: Date.now(), quantity: 1, customization: '' },
      ]);
      setSingleSelections((prev) => ({
        ...prev,
        [ingredient.ingredient_category_id]: ingredient.ingredient_id,
      }));
    } else {
      // Multi-select (like Packaging) or normal items
      setCart((prev) => [...prev, { ...ingredient, cart_id: Date.now(), quantity: 1, customization: '' }]);
    }
  };

  const removeFromCart = (cartId: number) => {
    setCart((prev) => prev.filter((i) => i.cart_id !== cartId));
  };

  const subtotal = cart.reduce(
    (sum, i) => sum + ((i.category_id === 7 ? 0 : i.item_cost) || i.ingredient_cost || 0) * i.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const selectedCategoryName =
    categories.find((c) => c.category_id === selectedCategory)?.name || 'Items';

  return (
    <div className="orders-layout">
      {/* Left sidebar */}
      <div className="sidebar sidebar-left">
        <h2 className="section-title">Item Categories</h2>
        <div className="category-list">
          {categories.map((category) => (
            <button
              key={category.category_id}
              onClick={() => setSelectedCategory(category.category_id)}
              className={`category-btn ${selectedCategory === category.category_id ? 'active' : ''}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu items / ingredients section */}
      <div className="content">
        <CashierNavbar />
        <h2 className="section-title">{selectedCategoryName}</h2>

        {selectedCategory === 7 ? (
          sortedCategoryNames.map((catName) => {
            const ingList = groupedIngredients[catName];
            const catId = ingList[0].ingredient_category_id;
            const isSingleSelect = miscSingleSelectIds.includes(catId);
            const currentlySelectedId = singleSelections[catId];
            return (
              <div key={catName} className="ingredient-group">
                <h3 className="ingredient-category-title">{catName}</h3>
                <div className="item-grid">
                  {ingList.map((item) => {
                    const isSelected = cart.some((c) => c.ingredient_id === item.ingredient_id);
                    return (
                      <button
                        key={item.ingredient_id}
                        onClick={() => addToCart(item)}
                        className={`item-card ${isSelected ? 'selected' : ''}`}
                        disabled={isSingleSelect && Boolean(currentlySelectedId) && currentlySelectedId !== item.ingredient_id}
                      >
                        <h3 className="item-name">{item.ingredient_name}</h3>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : items.filter((i) => i.category_id === selectedCategory).length === 0 ? (
          <p className="empty muted">No items found.</p>
        ) : (
          <div className="item-grid">
            {items
              .filter((item) => item.category_id === selectedCategory)
              .map((item) => (
                <button key={item.item_id} onClick={() => addToCart(item)} className="item-card">
                  <h3 className="item-name">{item.item_name}</h3>
                  <p className="item-price">${item.item_cost.toFixed(2)}</p>
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Checkout */}
      <div className="sidebar sidebar-right">
        <div className="order-top">
          <h2 className="order-title">Current Order</h2>
        </div>

        <div className="order-lines">
          {cart.length === 0 ? (
            <p className="empty muted">No items in cart</p>
          ) : (
            cart.map((item) => (
              <div key={item.cart_id} className="order-line">
                <div>
                  <div className="order-line-title">{item.item_name || item.ingredient_name}</div>
                  <div className="order-line-sub">{item.customization}</div>
                </div>
                <div className="order-line-amt">
                  <span className="order-line-total">
                    ${((item.item_cost || item.ingredient_cost) * item.quantity).toFixed(2)}
                  </span>
                  <button onClick={() => removeFromCart(item.cart_id)} className="order-line-remove">
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