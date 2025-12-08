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
  const singleSelectCategories = ['Milk', 'Ice Level', 'Sizes', 'Sweetness Level', 'Toppings'];

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

  // Group ingredients by category
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

  // Filter normal items (exclude Misc category)
  const filteredItems = selectedCategory === 7
    ? []
    : items.filter((item: any) => item.category_id === selectedCategory);

  // Add drink and open customization popup
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

  // Add ingredient to last drink
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

  // Remove ingredient
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
    const drinkExtras = d.extras.reduce((s: number, e: any) => s + e.ingredient_cost, 0);
    const perDrink = d.item.item_cost + drinkExtras;
    return sum + perDrink * d.quantity;
  }, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  // Only Packaging in Misc
  const allowedMiscCategoryNames = Object.keys(groupedIngredients).filter((catName: string) => {
    const list = groupedIngredients[catName];
    return list[0] && list[0].ingredient_category_name === 'Packaging';
  });

  const changeQuantity = (drinkId: number, delta: number) => {
    setCart(prev =>
      prev.map((d: any) => {
        if (d.cart_id !== drinkId) return d;
        const newQty = d.quantity + delta;
        return {
          ...d,
          quantity: newQty < 1 ? 1 : newQty, // never go below 1
        };
      })
    );
  };

  // --- Customization Handlers ---
  const setCustomizationOption = (category: string, ing: any) => {
    if (!customizingDrink) return;

    const current = customizingDrink.ingredients[category];

    const isSame = current && current.ingredient_id === ing.ingredient_id;

    setCustomizingDrink({
      ...customizingDrink,
      ingredients: {
        ...customizingDrink.ingredients,
        [category]: isSame ? null : ing,
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

  const openCustomizationForDrink = (drink: any) => {
    const copy = {
      ...drink,
      ingredients: { ...drink.ingredients },
      extras: [...drink.extras],
    };

    setCustomizingDrink(copy);
    setShowCustomizationPopup(true);
  };

  return (
    <div className="orders-layout">
      {/* LEFT SIDEBAR */}
      <div className="sidebar sidebar-left">
        <h2 className="section-title">Item Categories</h2>
        <div className="category-list">
          {categories.map((c: any) => (
            <button
              key={c.category_id}
              onClick={() => setSelectedCategory(c.category_id)}
              className={`category-btn ${selectedCategory === c.category_id ? 'active' : ''}`}
            >
              {c.name}
            </button>
          ))}
          {!categories.some(c => c.category_id === 7) && (
            <button
              onClick={() => setSelectedCategory(7)}
              className={`category-btn ${selectedCategory === 7 ? 'active' : ''}`}
            >
              Misc
            </button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="content">
        <CashierNavbar />
        <h2 className="section-title">{categories.find((c: any) => c.category_id === selectedCategory)?.name || 'Items'}</h2>

        {selectedCategory === 7 ? (
          allowedMiscCategoryNames.map((catName: string) => (
            <div key={catName} className="ingredient-group">
              <h3 className="ingredient-category-title">{catName}</h3>
              <div className="item-grid">
                {groupedIngredients[catName].map((item: any) => (
                  <button
                    key={item.ingredient_ID}
                    onClick={() => addIngredient(item)}
                    className={`item-card ${cart.some((d: any) => d.extras.some((ex: any) => ex.ingredient_ID === item.ingredient_ID)) ? 'selected' : ''}`}
                  >
                    <div className="thumb">
                      {item.photo ? (
                        <img src={item.photo} alt={item.ingredient_name} className="thumb-img" />
                      ) : (
                        <span className="thumb-ph">No image</span>
                      )}
                    </div>
                    <h3 className="item-name">{item.ingredient_name}</h3>
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

      {/* RIGHT SIDEBAR / CART */}
      <div className="sidebar sidebar-right">
        <h2 className="order-title">Current Order</h2>

      <div className="order-lines" >
        {cart.length === 0 ? (
          <p className="empty muted">No items in cart</p>
        ) : (
          cart.map((d: any) => (
            <div key={d.cart_id} className="order-line" onClick={() => openCustomizationForDrink(d)} style={{ cursor: 'pointer' }}>
                <div>
                  <div className="order-line-title">
                    {d.item.item_name}
                  </div>
                  <div className="order-line-sub">
                    {Object.entries(d.ingredients).map(([cat, ing]: [string, any]) => (
                      ing ? (
                        <div key={cat}>
                          <span>{ing.ingredient_name}</span>
                        </div>
                      ) : null
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', }}> 
                  <div className="order-line-amt">
                    <span className="order-line-total">
                      {(() => {
                        const extrasCost = d.extras.reduce(
                          (s: number, e: any) => s + e.ingredient_cost,
                          0
                        );
                        const perDrink = d.item.item_cost + extrasCost;
                        return `$${(perDrink * d.quantity).toFixed(2)}`;
                      })()}
                    </span>

                    <button
                      className="order-line-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeDrink(d.cart_id);
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <div className="qty-controls">
                    <button
                      className="qty-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        changeQuantity(d.cart_id, -1);
                      }}
                    >
                      -
                    </button>

                    <span className="qty-display">{d.quantity}</span>

                    <button
                      className="qty-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        changeQuantity(d.cart_id, 1);
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
          ))
          
        )}
      </div>

        <div className="totals-card">
          <div className="totals-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="totals-row"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
          <div className="totals-row totals-row-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
        </div>

        <button disabled={cart.length === 0} className="btn btn-checkout" onClick={() => setShowCheckoutPopup(true)}>Checkout</button>
      </div>

      {/* --- Checkout Popup --- */}
      {showCheckoutPopup && (
        <div className="checkout-backdrop">
          <div className="checkout-modal">
            <h3 className="checkout-title">Review Your Order</h3>

            <div className="checkout-lines">
              {cart.map((d: any) => {
                const extrasCost = d.extras.reduce(
                  (s: number, e: any) => s + e.ingredient_cost,
                  0
                );
                const perDrink = d.item.item_cost + extrasCost;
                const lineTotal = perDrink * d.quantity;

                return (
                  <div key={d.cart_id} className="checkout-line">
                    {/* Thumbnail */}
                    <div className="checkout-thumb">
                      {d.item.photo ? (
                        <img
                          src={d.item.photo}
                          alt={d.item.item_name}
                          className="checkout-thumb-img"
                        />
                      ) : (
                        <div className="checkout-thumb-ph">No image</div>
                      )}
                    </div>

                    {/* Drink details */}
                    <div className="checkout-line-main">
                      <span className="checkout-line-name">
                        {d.item.item_name}
                      </span>


                      <div className="checkout-line-ingredients">
                        {Object.entries(d.ingredients).map(
                          ([cat, ing]: [string, any]) =>
                            ing && (
                              <div key={cat}>
                                {ing.ingredient_name}
                              </div>
                            )
                        )}
                        {d.extras.map((e: any) => (
                          <div key={e.ingredient_ID}>
                            {e.ingredient_name}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Qty + line total */}
                    <div className="checkout-line-meta">
                      <div className="checkout-line-total">
                        ${lineTotal.toFixed(2)}
                      </div>
                      <div className="checkout-line-qty">
                        Qty: <strong>{d.quantity}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="checkout-summary">
              <div className="checkout-summary-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="checkout-summary-row">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="checkout-summary-row checkout-summary-total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="checkout-actions">
              <button
                className="btn btn-primary"
                onClick={() => {
                  const outOfStock = cart.some((d: any) => !d.item.in_stock);
                  if (outOfStock) {
                    alert(
                      'Some items are out of stock. Please remove them from your order.'
                    );
                  } else {
                    alert('Thank you for your order! Have a nice day.');
                    setCart([]);
                    setShowCheckoutPopup(false);
                  }
                }}
              >
                Confirm
              </button>

              <button
                className="btn btn-ghost"
                onClick={() => setShowCheckoutPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


      {/* --- Customization Popup --- */}
      {showCustomizationPopup && customizingDrink && (
        <div className="customization-popup" style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '500px', maxHeight: '80vh', overflowY: 'auto'
          }}>
            <h3 className="section-title" style={{ textAlign: 'center', marginBottom: '1rem' }}>Customize {customizingDrink.item.item_name}</h3>
              {singleSelectCategories.map(cat => (
              <div key={cat} style={{ marginBottom: '1rem' }}>
                <h4>{cat}</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {groupedIngredients[cat]?.map((ing: any) => (
                    <button
                      key={ing.ingredient_ID}
                      onClick={() => setCustomizationOption(cat, ing)}
                      className={`btn ${customizingDrink.ingredients[cat]?.ingredient_id === ing.ingredient_id ? 'active' : ''}`}
                    >
                      {ing.ingredient_name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button className="logout" onClick={confirmCustomization} style={{ marginRight: '1rem' }}>Confirm</button>
              <button className="btn" onClick={cancelCustomization}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




