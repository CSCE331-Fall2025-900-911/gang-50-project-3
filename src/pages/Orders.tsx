// import { useState, useEffect } from 'react';
// import CashierNavbar from '../components/CashierNavbar';

// export default function Orders() {
//   const [categories, setCategories] = useState<any[]>([]);
//   const [items, setItems] = useState<any[]>([]);
//   const [ingredients, setIngredients] = useState<any[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
//   const [cart, setCart] = useState<any[]>([]);
//   const [error, setError] = useState<string | null>(null);

//   const API_URL = '/api';
//   const singleSelectCategories = ['Milk', 'Ice Level', 'Sizes', 'Sweetness Level'];
//   const miscIngredientCategoryIds = [1, 3, 6, 7, 8];

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const c = await fetch(`${API_URL}/categories`).then(r => r.json());
//         const i = await fetch(`${API_URL}/items`).then(r => r.json());
//         const g = await fetch(`${API_URL}/ingredients`).then(r => r.json());

//         setCategories(c);
//         setItems(i);
//         setIngredients(g);
//         if (c.length) setSelectedCategory(c[0].category_id);
//       } catch (err: any) {
//         console.error(err);
//         setError('Failed to load data');
//       }
//     };
//     load();
//   }, []);

//   if (error) {
//     return (
//       <div className="error-screen">
//         <CashierNavbar />
//         <div className="error-container" style={{ textAlign: 'center', marginTop: '3rem' }}>
//           <h2>Something went wrong</h2>
//           <p>{error}</p>
//           <button onClick={() => window.location.reload()} className="btn">Retry</button>
//         </div>
//       </div>
//     );
//   }

//   const groupedIngredients: Record<string, any[]> = {};
//   for (const ingRaw of ingredients) {
//     const ing = ingRaw as any;
//     const catName = ing.ingredient_category_name || 'Other';
//     if (!groupedIngredients[catName]) groupedIngredients[catName] = [];
//     groupedIngredients[catName].push(ing);
//   }

//   Object.keys(groupedIngredients).forEach(catName => {
//     groupedIngredients[catName].sort((a: any, b: any) => a.ingredient_name.localeCompare(b.ingredient_name));
//   });

//   const filteredItems = selectedCategory === 7
//     ? []
//     : items.filter((item: any) => item.category_id === selectedCategory);

//   const addDrink = (item: any) => {
//     setCart(prev => [
//       ...prev,
//       {
//         cart_id: Date.now(),
//         item,
//         quantity: 1,
//         ingredients: {
//           Milk: null,
//           'Ice Level': null,
//           Sizes: null,
//           'Sweetness Level': null,
//         },
//         extras: [] as any[],
//       },
//     ]);
//   };

//   const addIngredient = (ingRaw: any) => {
//     const ing = ingRaw as any;
//     const lastDrink = [...cart].reverse().find((d: any) => d.item);
//     if (!lastDrink) return alert('Select a drink first');

//     const drinkId = lastDrink.cart_id;

//     setCart(prev => prev.map((d: any) => {
//       if (d.cart_id !== drinkId) return d;

//       if (singleSelectCategories.includes(ing.ingredient_category_name)) {
//         return {
//           ...d,
//           ingredients: {
//             ...d.ingredients,
//             [ing.ingredient_category_name]: ing,
//           },
//         };
//       }

//       return {
//         ...d,
//         extras: [...d.extras, ing],
//       };
//     }));
//   };

//   const removeIngredient = (drinkId: any, catName: any, ingId: any) => {
//     setCart(prev => prev.map((d: any) => {
//       if (d.cart_id !== drinkId) return d;

//       if (singleSelectCategories.includes(catName)) {
//         return {
//           ...d,
//           ingredients: {
//             ...d.ingredients,
//             [catName]: null,
//           },
//         };
//       }

//       return {
//         ...d,
//         extras: d.extras.filter((e: any) => e.ingredient_ID !== ingId),
//       };
//     }));
//   };

//   const removeDrink = (drinkId: any) => {
//     setCart(prev => prev.filter((d: any) => d.cart_id !== drinkId));
//   };

//   // Calculate subtotal only from drinks, not from customizations
//   const subtotal = cart.reduce((sum: number, d: any) => sum + d.item.item_cost, 0);
//   const tax = subtotal * 0.08;
//   const total = subtotal + tax;

//   const allowedMiscCategoryNames = Object.keys(groupedIngredients).filter((catName: string) => {
//     const list = groupedIngredients[catName];
//     return list[0] && miscIngredientCategoryIds.includes(list[0].category_id);
//   });

//   return (
//     <div className="orders-layout">
//       <div className="sidebar sidebar-left">
//         <h2 className="section-title">Item Categories</h2>
//         <div className="category-list">
//           {categories.map((c: any) => (
//             <button key={c.category_id} onClick={() => setSelectedCategory(c.category_id)} className={`category-btn ${selectedCategory === c.category_id ? 'active' : ''}`}>
//               {c.name}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div className="content">
//         <CashierNavbar />
//         <h2 className="section-title">{categories.find((c: any) => c.category_id === selectedCategory)?.name || 'Items'}</h2>

//         {selectedCategory === 7 ? (
//           allowedMiscCategoryNames.map((catName: string) => (
//             <div key={catName} className="ingredient-group">
//               <h3 className="ingredient-category-title">{catName}</h3>
//               <div className="item-grid">
//                 {groupedIngredients[catName].map((item: any) => (
//                   <button key={item.ingredient_ID} onClick={() => addIngredient(item)} className={`item-card ${cart.some((d: any) => d.extras.some((ex: any) => ex.ingredient_ID === item.ingredient_ID)) ? 'selected' : ''}`}>
//                     <div className="thumb">
//                       {item.photo ? (
//                         <img src={item.photo} alt={item.ingredient_name} className="thumb-img" />
//                       ) : (
//                         <span className="thumb-ph">No image</span>
//                       )}
//                     </div>
//                     <h3 className="item-name">{item.ingredient_name}</h3>
                    
//                   </button>
//                 ))}
//               </div>
//             </div>
//           ))
//         ) : (
//           filteredItems.length === 0 ? (
//             <p className="empty muted">No items found.</p>
//           ) : (
//             <div className="item-grid">
//               {filteredItems.map((item: any) => (
//                 <button key={item.item_id} onClick={() => addDrink(item)} className="item-card">
//                   <div className="thumb">
//                     {item.photo ? (
//                       <img src={item.photo} alt={item.item_name} className="thumb-img" />
//                     ) : (
//                       <span className="thumb-ph">No image</span>
//                     )}
//                   </div>
//                   <h3 className="item-name">{item.item_name}</h3>
//                   <p className="item-price">${item.item_cost.toFixed(2)}</p>
//                 </button>
//               ))}
//             </div>
//           )
//         )}
//       </div>

//       <div className="sidebar sidebar-right">
//         <h2 className="order-title">Current Order</h2>
//         {cart.length === 0 ? (
//           <p className="empty muted">No items in cart</p>
//         ) : (
//           cart.map((d: any) => (
//             <div key={d.cart_id} className="order-drink">
//               <div className="order-drink-header">
//                 <strong>{d.item.item_name}</strong>
//                 <button onClick={() => removeDrink(d.cart_id)}>×</button>
//               </div>
//               <div className="order-ingredients">
//                 {Object.entries(d.ingredients).map(([cat, ing]: [string, any]) => (
//                   ing ? (
//                     <div key={cat} className="order-line">
//                       <span>{cat}: {ing.ingredient_name}</span>
//                       <button onClick={() => removeIngredient(d.cart_id, cat, ing.ingredient_ID)}>×</button>
//                     </div>
//                   ) : null
//                 ))}
//                 {d.extras.map((e: any) => (
//                   <div key={e.ingredient_ID} className="order-line">
//                     <span>{e.ingredient_name}</span>
//                     <button onClick={() => removeIngredient(d.cart_id, 'extras', e.ingredient_ID)}>×</button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ))
//         )}

//         <div className="totals-card">
//           <div className="totals-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
//           <div className="totals-row"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
//           <div className="totals-row totals-row-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
//         </div>

//         <button disabled={cart.length === 0} className="btn btn-checkout">Checkout</button>
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
  const [showCheckoutPopup, setShowCheckoutPopup] = useState(false);

  const API_URL = '/api';
  const singleSelectCategories = ['Milk', 'Ice Level', 'Sizes', 'Sweetness Level'];
  const miscIngredientCategoryIds = [1, 3, 6, 7, 8];

  useEffect(() => {
    const load = async () => {
      try {
        const c = await fetch(`${API_URL}/categories`).then(r => r.json());
        const i = await fetch(`${API_URL}/items`).then(r => r.json());
        const g = await fetch(`${API_URL}/ingredients`).then(r => r.json());

        setCategories(c);
        setItems(i);
        setIngredients(g);
        if (c.length) setSelectedCategory(c[0].category_id);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load data');
      }
    };
    load();
  }, []);

  if (error) {
    return (
      <div className="error-screen">
        <CashierNavbar />
        <div className="error-container" style={{ textAlign: 'center', marginTop: '3rem' }}>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn">Retry</button>
        </div>
      </div>
    );
  }

  const groupedIngredients: Record<string, any[]> = {};
  for (const ingRaw of ingredients) {
    const ing = ingRaw as any;
    const catName = ing.ingredient_category_name || 'Other';
    if (!groupedIngredients[catName]) groupedIngredients[catName] = [];
    groupedIngredients[catName].push(ing);
  }

  Object.keys(groupedIngredients).forEach(catName => {
    groupedIngredients[catName].sort((a: any, b: any) => a.ingredient_name.localeCompare(b.ingredient_name));
  });

  const filteredItems = selectedCategory === 7
    ? []
    : items.filter((item: any) => item.category_id === selectedCategory);

  const addDrink = (item: any) => {
    setCart(prev => [
      ...prev,
      {
        cart_id: Date.now(),
        item,
        quantity: 1,
        ingredients: {
          Milk: null,
          'Ice Level': null,
          Sizes: null,
          'Sweetness Level': null,
        },
        extras: [] as any[],
      },
    ]);
  };

  const addIngredient = (ingRaw: any) => {
    const ing = ingRaw as any;
    const lastDrink = [...cart].reverse().find((d: any) => d.item);
    if (!lastDrink) return alert('Select a drink first');

    const drinkId = lastDrink.cart_id;

    setCart(prev => prev.map((d: any) => {
      if (d.cart_id !== drinkId) return d;

      if (singleSelectCategories.includes(ing.ingredient_category_name)) {
        return {
          ...d,
          ingredients: {
            ...d.ingredients,
            [ing.ingredient_category_name]: ing,
          },
        };
      }

      return {
        ...d,
        extras: [...d.extras, ing],
      };
    }));
  };

  const removeIngredient = (drinkId: any, catName: any, ingId: any) => {
    setCart(prev => prev.map((d: any) => {
      if (d.cart_id !== drinkId) return d;

      if (singleSelectCategories.includes(catName)) {
        return {
          ...d,
          ingredients: {
            ...d.ingredients,
            [catName]: null,
          },
        };
      }

      return {
        ...d,
        extras: d.extras.filter((e: any) => e.ingredient_ID !== ingId),
      };
    }));
  };

  const removeDrink = (drinkId: any) => {
    setCart(prev => prev.filter((d: any) => d.cart_id !== drinkId));
  };

  const subtotal = cart.reduce((sum: number, d: any) => sum + d.item.item_cost, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const allowedMiscCategoryNames = Object.keys(groupedIngredients).filter((catName: string) => {
    const list = groupedIngredients[catName];
    return list[0] && miscIngredientCategoryIds.includes(list[0].category_id);
  });

  return (
    <div className="orders-layout">
      <div className="sidebar sidebar-left">
        <h2 className="section-title">Item Categories</h2>
        <div className="category-list">
          {categories.map((c: any) => (
            <button key={c.category_id} onClick={() => setSelectedCategory(c.category_id)} className={`category-btn ${selectedCategory === c.category_id ? 'active' : ''}`}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="content">
        <CashierNavbar />
        <h2 className="section-title">{categories.find((c: any) => c.category_id === selectedCategory)?.name || 'Items'}</h2>

        {selectedCategory === 7 ? (
          allowedMiscCategoryNames.map((catName: string) => (
            <div key={catName} className="ingredient-group">
              <h3 className="ingredient-category-title">{catName}</h3>
              <div className="item-grid">
                {groupedIngredients[catName].map((item: any) => (
                  <button key={item.ingredient_ID} onClick={() => addIngredient(item)} className={`item-card ${cart.some((d: any) => d.extras.some((ex: any) => ex.ingredient_ID === item.ingredient_ID)) ? 'selected' : ''}`}>
                    <div className="thumb">
                      {item.photo ? (
                        <img src={item.photo} alt={item.ingredient_name} className="thumb-img" />
                      ) : (
                        <span className="thumb-ph">No image</span>
                      )}
                    </div>
                    <h3 className="item-name">{item.ingredient_name}</h3>
                    <p className="item-price">$0.00</p>
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          filteredItems.length === 0 ? (
            <p className="empty muted">No items found.</p>
          ) : (
            <div className="item-grid">
              {filteredItems.map((item: any) => (
                <button key={item.item_id} onClick={() => addDrink(item)} className="item-card">
                  <div className="thumb">
                    {item.photo ? (
                      <img src={item.photo} alt={item.item_name} className="thumb-img" />
                    ) : (
                      <span className="thumb-ph">No image</span>
                    )}
                  </div>
                  <h3 className="item-name">{item.item_name}</h3>
                  <p className="item-price">${item.item_cost.toFixed(2)}</p>
                </button>
              ))}
            </div>
          )
        )}
      </div>

      <div className="sidebar sidebar-right">
        <h2 className="order-title">Current Order</h2>
        {cart.length === 0 ? (
          <p className="empty muted">No items in cart</p>
        ) : (
          cart.map((d: any) => (
            <div key={d.cart_id} className="order-drink">
              <div className="order-drink-header">
                <strong>{d.item.item_name}</strong>
                <button onClick={() => removeDrink(d.cart_id)}>×</button>
              </div>
              <div className="order-ingredients">
                {Object.entries(d.ingredients).map(([cat, ing]: [string, any]) => (
                  ing ? (
                    <div key={cat} className="order-line">
                      <span>{cat}: {ing.ingredient_name}</span>
                      <button onClick={() => removeIngredient(d.cart_id, cat, ing.ingredient_ID)}>×</button>
                    </div>
                  ) : null
                ))}
                {d.extras.map((e: any) => (
                  <div key={e.ingredient_ID} className="order-line">
                    <span>{e.ingredient_name} (+${e.ingredient_cost})</span>
                    <button onClick={() => removeIngredient(d.cart_id, 'extras', e.ingredient_ID)}>×</button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        <div className="totals-card">
          <div className="totals-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="totals-row"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
          <div className="totals-row totals-row-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
        </div>

        <button disabled={cart.length === 0} className="btn btn-checkout" onClick={() => setShowCheckoutPopup(true)}>Checkout</button>
      </div>

      {showCheckoutPopup && (
        <div className="checkout-popup">
          <div className="checkout-content">
            <h3>Confirm Checkout?</h3>
            <button className="btn" onClick={() => { /* handle confirm logic */ setShowCheckoutPopup(false); }}>Confirm</button>
            <button className="btn" onClick={() => setShowCheckoutPopup(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
