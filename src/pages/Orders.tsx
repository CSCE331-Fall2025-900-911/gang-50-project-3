// import { useState, useEffect } from 'react';
// import CashierNavbar from '../components/CashierNavbar';

// export default function Orders() {
//   const [categories, setCategories] = useState<any[]>([]);
//   const [items, setItems] = useState<any[]>([]);
//   const [ingredients, setIngredients] = useState<any[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
//   const [cart, setCart] = useState<any[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [showCheckoutPopup, setShowCheckoutPopup] = useState(false);
//   const [showCustomizationPopup, setShowCustomizationPopup] = useState(false);
//   const [customizingDrink, setCustomizingDrink] = useState<any | null>(null);

//   const API_URL = '/api';
//   const singleSelectCategories = ['Milk', 'Ice Level', 'Sizes', 'Sweetness Level'];

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
//       <div>
//         <CashierNavbar />
//         <div>
//           <h2>Something went wrong</h2>
//           <p>{error}</p>
//           <button onClick={() => window.location.reload()}>Retry</button>
//         </div>
//       </div>
//     );
//   }

//   // Group ingredients by category
//   const groupedIngredients: Record<string, any[]> = {};
//   for (const ingRaw of ingredients) {
//     const ing: any = ingRaw;
//     const catName = ing.ingredient_category_name || 'Other';
//     if (!groupedIngredients[catName]) groupedIngredients[catName] = [];
//     groupedIngredients[catName].push(ing);
//   }

//   Object.keys(groupedIngredients).forEach(catName => {
//     groupedIngredients[catName].sort((a: any, b: any) => (a.ingredient_name || '').localeCompare(b.ingredient_name || ''));
//   });

//   const filteredItems = selectedCategory === 7
//     ? []
//     : items.filter((item: any) => item.category_id === selectedCategory);

//   const addDrink = (item: any) => {
//     const newDrink = {
//       cart_id: Date.now(),
//       item,
//       quantity: 1,
//       ingredients: {
//         Milk: null,
//         'Ice Level': null,
//         Sizes: null,
//         'Sweetness Level': null,
//       },
//       extras: [] as any[],
//     };
//     setCart(prev => [...prev, newDrink]);
//     setCustomizingDrink(newDrink);
//     setShowCustomizationPopup(true);
//   };

//   const addIngredient = (ingRaw: any) => {
//     const ing: any = ingRaw;
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

//   const subtotal = cart.reduce((sum: number, d: any) => {
//     const drinkExtras = d.extras.reduce((s: number, e: any) => s + (e.ingredient_cost || 0), 0);
//     return sum + (d.item.item_cost || 0) + drinkExtras;
//   }, 0);
//   const tax = subtotal * 0.08;
//   const total = subtotal + tax;

//   const allowedMiscCategoryNames = Object.keys(groupedIngredients).filter((catName: string) => {
//     const list = groupedIngredients[catName];
//     return list[0] && list[0].ingredient_category_name === 'Packaging';
//   });

//   const setCustomizationOption = (category: string, ing: any) => {
//     if (!customizingDrink) return;
//     setCustomizingDrink({
//       ...customizingDrink,
//       ingredients: {
//         ...customizingDrink.ingredients,
//         [category]: ing,
//       },
//     });
//   };

//   const confirmCustomization = () => {
//     if (!customizingDrink) return;
//     setCart(prev => prev.map(d => d.cart_id === customizingDrink.cart_id ? customizingDrink : d));
//     setCustomizingDrink(null);
//     setShowCustomizationPopup(false);
//   };

//   const cancelCustomization = () => {
//     setCustomizingDrink(null);
//     setShowCustomizationPopup(false);
//   };

//   return (
//     <div>
//       <CashierNavbar />

//       <div>
//         <h2>Categories</h2>
//         {categories.map((c: any) => (
//           <button key={c.category_id} onClick={() => setSelectedCategory(c.category_id)}>
//             {c.name}
//           </button>
//         ))}
//         {!categories.some((c: any) => c.category_id === 7) && (
//           <button onClick={() => setSelectedCategory(7)}>Misc</button>
//         )}
//       </div>

//       <div>
//         <h2>{categories.find((c: any) => c.category_id === selectedCategory)?.name || 'Items'}</h2>

//         {selectedCategory === 7 ? (
//           allowedMiscCategoryNames.map(catName => (
//             <div key={catName}>
//               <h3>{catName}</h3>
//               {groupedIngredients[catName].map((item: any) => (
//                 <button key={item.ingredient_ID} onClick={() => addIngredient(item)}>
//                   {item.ingredient_name}
//                 </button>
//               ))}
//             </div>
//           ))
//         ) : (
//           filteredItems.map((item: any) => (
//             <button key={item.item_id} onClick={() => addDrink(item)}>
//               {item.item_name} - ${item.item_cost?.toFixed(2)}
//             </button>
//           ))
//         )}
//       </div>

//       <div>
//         <h2>Cart</h2>
//         {cart.map((d: any) => (
//           <div key={d.cart_id}>
//             <strong>{d.item.item_name}</strong>
//             <button onClick={() => removeDrink(d.cart_id)}>Remove</button>
//             <div>
//               {Object.entries(d.ingredients).map(([cat, ing]: [string, any]) =>
//                 ing ? <div key={cat}>{cat}: {ing.ingredient_name} <button onClick={() => removeIngredient(d.cart_id, cat, ing.ingredient_ID)}>×</button></div> : null
//               )}
//               {d.extras.map((e: any) => (
//                 <div key={e.ingredient_ID}>{e.ingredient_name} (+${e.ingredient_cost}) <button onClick={() => removeIngredient(d.cart_id, 'extras', e.ingredient_ID)}>×</button></div>
//               ))}
//             </div>
//           </div>
//         ))}

//         <div>
//           <div>Subtotal: ${subtotal.toFixed(2)}</div>
//           <div>Tax: ${tax.toFixed(2)}</div>
//           <div>Total: ${total.toFixed(2)}</div>
//         </div>

//         <button disabled={cart.length === 0} onClick={() => setShowCheckoutPopup(true)}>Checkout</button>
//       </div>

//       {showCheckoutPopup && (
//         <div>
//           <div>
//             <h3>Review Your Order</h3>
//             {cart.map((d: any) => (
//               <div key={d.cart_id}>
//                 <strong>{d.item.item_name}</strong> - ${d.item.item_cost?.toFixed(2)}
//                 <div>
//                   {Object.entries(d.ingredients).map(([cat, ing]: [string, any]) => ing ? <div key={cat}>{cat}: {ing.ingredient_name}</div> : null)}
//                   {d.extras.map((e: any) => <div key={e.ingredient_ID}>{e.ingredient_name} (+${e.ingredient_cost})</div>)}
//                 </div>
//               </div>
//             ))}
//             <div>
//               <div>Subtotal: ${subtotal.toFixed(2)}</div>
//               <div>Tax: ${tax.toFixed(2)}</div>
//               <div>Total: ${total.toFixed(2)}</div>
//             </div>
//             <div>
//               <button onClick={() => setShowCheckoutPopup(false)}>Confirm</button>
//               <button onClick={() => setShowCheckoutPopup(false)}>Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {showCustomizationPopup && customizingDrink && (
//         <div>
//           <div>
//             <h3>Customize {customizingDrink.item.item_name}</h3>
//             {singleSelectCategories.map(cat => (
//               <div key={cat}>
//                 <h4>{cat}</h4>
//                 {groupedIngredients[cat]?.map((ing: any) => (
//                   <button key={ing.ingredient_ID} onClick={() => setCustomizationOption(cat, ing)}>
//                     {ing.ingredient_name}
//                   </button>
//                 ))}
//               </div>
//             ))}
//             <div>
//               <button onClick={confirmCustomization}>Confirm</button>
//               <button onClick={cancelCustomization}>Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}
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
  const [showCustomizationPopup, setShowCustomizationPopup] = useState(false);
  const [customizingDrink, setCustomizingDrink] = useState<any | null>(null);

  const API_URL = '/api';
  const singleSelectCategories = ['Milk', 'Ice Level', 'Sizes', 'Sweetness Level'];

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
      <div>
        <CashierNavbar />
        <div>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  // Group ingredients by category
  const groupedIngredients: Record<string, any[]> = {};
  for (const ingRaw of ingredients) {
    const ing: any = ingRaw;
    const catName = ing.ingredient_category_name || 'Other';
    if (!groupedIngredients[catName]) groupedIngredients[catName] = [];
    groupedIngredients[catName].push(ing);
  }

  Object.keys(groupedIngredients).forEach(catName => {
    groupedIngredients[catName].sort((a: any, b: any) => (a.ingredient_name || '').localeCompare(b.ingredient_name || ''));
  });

  const filteredItems = selectedCategory === 7
    ? []
    : items.filter((item: any) => item.category_id === selectedCategory);

  const addDrink = (item: any) => {
    const newDrink = {
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
    };
    setCart(prev => [...prev, newDrink]);
    setCustomizingDrink(newDrink);
    setShowCustomizationPopup(true);
  };

  const addIngredient = (ingRaw: any) => {
    const ing: any = ingRaw;
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

  const subtotal = cart.reduce((sum: number, d: any) => {
    const drinkExtras = d.extras.reduce((s: number, e: any) => s + (e.ingredient_cost || 0), 0);
    return sum + (d.item.item_cost || 0) + drinkExtras;
  }, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const allowedMiscCategoryNames = Object.keys(groupedIngredients).filter((catName: string) => {
    const list = groupedIngredients[catName];
    return list[0] && list[0].ingredient_category_name === 'Packaging';
  });

  const setCustomizationOption = (category: string, ing: any) => {
    if (!customizingDrink) return;
    setCustomizingDrink({
      ...customizingDrink,
      ingredients: {
        ...customizingDrink.ingredients,
        [category]: ing,
      },
    });
  };

  const confirmCustomization = () => {
    if (!customizingDrink) return;
    setCart(prev => prev.map(d => d.cart_id === customizingDrink.cart_id ? customizingDrink : d));
    setCustomizingDrink(null);
    setShowCustomizationPopup(false);
  };

  const cancelCustomization = () => {
    setCustomizingDrink(null);
    setShowCustomizationPopup(false);
  };

  return (
    <div>
      <CashierNavbar />

      {/* Categories */}
      <div>
        <h2>Categories</h2>
        {categories.map((c: any) => (
          <button key={c.category_id} onClick={() => setSelectedCategory(c.category_id)}>
            {c.name}
          </button>
        ))}
        {!categories.some((c: any) => c.category_id === 7) && (
          <button onClick={() => setSelectedCategory(7)}>Misc</button>
        )}
      </div>

      {/* Items / Ingredients */}
      <div>
        <h2>{categories.find((c: any) => c.category_id === selectedCategory)?.name || 'Items'}</h2>

        {selectedCategory === 7 ? (
          allowedMiscCategoryNames.map(catName => (
            <div key={catName}>
              <h3>{catName}</h3>
              {groupedIngredients[catName].map((item: any) => (
                <button key={item.ingredient_ID} onClick={() => addIngredient(item)}>
                  {item.ingredient_name}
                </button>
              ))}
            </div>
          ))
        ) : (
          filteredItems.map((item: any) => (
            <button key={item.item_id} onClick={() => addDrink(item)}>
              {item.item_name} - ${item.item_cost?.toFixed(2)}
            </button>
          ))
        )}
      </div>

      {/* Cart */}
      <div>
        <h2>Cart</h2>
        {cart.map((d: any) => (
          <div key={d.cart_id}>
            <strong>{d.item.item_name}</strong>
            <button onClick={() => removeDrink(d.cart_id)}>Remove</button>
            <div>
              {Object.entries(d.ingredients).map(([cat, ing]: [string, any]) =>
                ing ? (
                  <div key={cat}>
                    {cat}: {ing.ingredient_name} <button onClick={() => removeIngredient(d.cart_id, cat, ing.ingredient_ID)}>×</button>
                  </div>
                ) : null
              )}
              {d.extras.map((e: any) => (
                <div key={e.ingredient_ID}>{e.ingredient_name} (+${e.ingredient_cost}) <button onClick={() => removeIngredient(d.cart_id, 'extras', e.ingredient_ID)}>×</button></div>
              ))}
            </div>
          </div>
        ))}

        <div>
          <div>Subtotal: ${subtotal.toFixed(2)}</div>
          <div>Tax: ${tax.toFixed(2)}</div>
          <div>Total: ${total.toFixed(2)}</div>
        </div>

        <button disabled={cart.length === 0} onClick={() => setShowCheckoutPopup(true)}>Checkout</button>
      </div>

      {/* Checkout Popup */}
      {showCheckoutPopup && (
        <div>
          <div>
            <h3>Review Your Order</h3>
            {cart.map((d: any) => (
              <div key={d.cart_id}>
                <strong>{d.item.item_name}</strong> - ${d.item.item_cost?.toFixed(2)}
                <div>
                  {Object.entries(d.ingredients).map(([cat, ing]: [string, any]) =>
                    ing ? <div key={cat}>{cat}: {ing.ingredient_name}</div> : null
                  )}
                  {d.extras.map((e: any) => <div key={e.ingredient_ID}>{e.ingredient_name} (+${e.ingredient_cost})</div>)}
                </div>
              </div>
            ))}
            <div>
              <div>Subtotal: ${subtotal.toFixed(2)}</div>
              <div>Tax: ${tax.toFixed(2)}</div>
              <div>Total: ${total.toFixed(2)}</div>
            </div>
            <div>
              <button onClick={() => setShowCheckoutPopup(false)}>Confirm</button>
              <button onClick={() => setShowCheckoutPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Customization Popup */}
      {showCustomizationPopup && customizingDrink && (
        <div>
          <div>
            <h3>Customize {customizingDrink.item.item_name}</h3>
            {singleSelectCategories.map(cat => (
              <div key={cat}>
                <h4>{cat}</h4>
                {groupedIngredients[cat]?.map((ing: any) => {
                  const isSelected = customizingDrink.ingredients[cat]?.ingredient_ID === ing.ingredient_ID;
                  return (
                    <button
                      key={ing.ingredient_ID}
                      onClick={() => setCustomizationOption(cat, ing)}
                      className={isSelected ? 'selected' : ''}
                    >
                      {ing.ingredient_name}
                    </button>
                  );
                })}
              </div>
            ))}
            <div>
              <button onClick={confirmCustomization}>Confirm</button>
              <button onClick={cancelCustomization}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
