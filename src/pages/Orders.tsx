import { useState, useEffect } from 'react';
import CashierNavbar from '../components/CashierNavbar';

export default function Orders() {
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showCheckoutPopup, setShowCheckoutPopup] = useState(false);
  const [showCustomizationPopup, setShowCustomizationPopup] = useState(false);
  const [customizingDrink, setCustomizingDrink] = useState<any | null>(null);

  const [dietaryFilter, setDietaryFilter] = useState<
    'all' | 'dairy_free' | 'gluten_free' | 'both_free'
  >('all');

  const miscIngredientPhotos: Record<string, string> = {
    Bag: '/ingredient_36.png',
    Lid: '/ingredient_32.png',
    Straw: '/ingredient_33.png',
    Napkin: '/ingredient_34.png',
    'To-go Box': '/ingredient_35.png',
  };

  const API_URL = '/api';
  const singleSelectCategories = ['Sizes', 'Milk', 'Ice Level', 'Sweetness Level'];

  const multiSelectCategories = ['Toppings'];

  const REQUIRED_CATEGORIES = ['Sizes', 'Milk', 'Ice Level', 'Sweetness Level'];

  useEffect(() => {
    const load = async () => {
      try {
        const c = await fetch(`${API_URL}/categories`).then((r) => r.json());
        const i = await fetch(`${API_URL}/admin/items`).then((r) => r.json());
        const g = await fetch(`${API_URL}/ingredients`).then((r) => r.json());

        setCategories(c);
        setItems(i);
        setIngredients(g);
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
          <button onClick={() => window.location.reload()} className="btn">
            Retry
          </button>
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
  Object.keys(groupedIngredients).forEach((catName) => {
    groupedIngredients[catName].sort((a: any, b: any) =>
      a.ingredient_name.localeCompare(b.ingredient_name),
    );
  });

  const addDrink = (item: any) => {
    const newDrink = {
      item,
      quantity: 1,
      temperature: 'Iced',
      ingredients: {
        Milk: null,
        'Ice Level': null,
        Sizes: null,
        'Sweetness Level': null,
      },
      extras: [] as any[],
    };
    setCustomizingDrink(newDrink);
    setShowCustomizationPopup(true);
  };

  // Add ingredient to last drink
  const addIngredient = (ingRaw: any) => {
    const ing = ingRaw as any;
    const lastDrink = [...cart].reverse().find((d: any) => d.item);
    if (!lastDrink) return alert('Select a drink first');

    const drinkId = lastDrink.cart_id;

    setCart((prev) =>
      prev.map((d: any) => {
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
      }),
    );
  };

  const removeDrink = (drinkId: any) => {
    setCart((prev) => prev.filter((d: any) => d.cart_id !== drinkId));
  };

  const subtotal = cart.reduce((sum: number, d: any) => {
    const drinkExtras = d.extras.reduce((s: number, e: any) => s + e.ingredient_cost, 0);
    const perDrink = d.item.item_cost + drinkExtras;
    return sum + perDrink * d.quantity;
  }, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  // Only Packaging in Misc
  const allowedMiscCategoryNames = Object.keys(groupedIngredients).filter(
    (catName: string) => {
      const list = groupedIngredients[catName];
      return list[0] && list[0].ingredient_category_name === 'Packaging';
    },
  );

  const changeQuantity = (drinkId: number, delta: number) => {
    setCart((prev) =>
      prev.map((d: any) => {
        if (d.cart_id !== drinkId) return d;
        const newQty = d.quantity + delta;
        return {
          ...d,
          quantity: newQty < 1 ? 1 : newQty, // never go below 1
        };
      }),
    );
  };

  // --- Customization Handlers ---
  const setCustomizationOption = (category: string, ing: any) => {
    if (!customizingDrink) return;

    const current = customizingDrink.ingredients[category];

    const isSame = current && current.ingredient_id === ing.ingredient_id;

    // If drink is Hot and this is an Ice Level that is NOT "No Ice", ignore
    if (
      category === 'Ice Level' &&
      customizingDrink.temperature === 'Hot' &&
      !/no ice/i.test(ing.ingredient_name)
    ) {
      return;
    }

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

    for (const cat of REQUIRED_CATEGORIES) {
      if (!customizingDrink.ingredients[cat]) {
        alert(`Please select a ${cat} option.`);
        return;
      }
    }

    if (
      customizingDrink.temperature === 'Hot' &&
      customizingDrink.ingredients['Ice Level'] &&
      !/no ice/i.test(customizingDrink.ingredients['Ice Level'].ingredient_name)
    ) {
      alert('Hot drinks must use the "No Ice" option.');
      return;
    }

    setCart((prev) => {
      if (customizingDrink.cart_id != null) {
        return prev.map((d) =>
          d.cart_id === customizingDrink.cart_id ? customizingDrink : d,
        );
      }

      const newDrinkWithId = {
        ...customizingDrink,
        cart_id: Date.now() + Math.random(),
      };

      return [...prev, newDrinkWithId];
    });

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
      temperature: drink.temperature || 'Iced',
      ingredients: { ...drink.ingredients },
      extras: [...drink.extras],
    };

    setCustomizingDrink(copy);
    setShowCustomizationPopup(true);
  };

  const toggleTopping = (ing: any) => {
    if (!customizingDrink) return;

    const exists = customizingDrink.extras.some(
      (e: any) => e.ingredient_id === ing.ingredient_id,
    );

    const newExtras = exists
      ? customizingDrink.extras.filter((e: any) => e.ingredient_id !== ing.ingredient_id)
      : [...customizingDrink.extras, ing];

    setCustomizingDrink({
      ...customizingDrink,
      extras: newExtras,
    });
  };

  // UPDATED: when Hot is selected, auto-set Ice Level to "No Ice"
  const setTemperature = (temp: 'Hot' | 'Iced') => {
    if (!customizingDrink) return;

    let updatedIngredients = { ...customizingDrink.ingredients };

    if (temp === 'Hot') {
      const iceOptions = groupedIngredients['Ice Level'] || [];
      const noIceOption = iceOptions.find((ing: any) =>
        /no ice/i.test(ing.ingredient_name),
      );
      if (noIceOption) {
        updatedIngredients['Ice Level'] = noIceOption;
      }
    }

    setCustomizingDrink({
      ...customizingDrink,
      temperature: temp,
      ingredients: updatedIngredients,
    });
  };

  const submitOrder = async () => {
    if (cart.length === 0) return;

    // validate required options for every drink before sending to backend
    for (const d of cart) {
      for (const cat of REQUIRED_CATEGORIES) {
        if (!d.ingredients[cat]) {
          alert(`Please select a ${cat} option for "${d.item.item_name}".`);
          return;
        }
      }
      if (
        d.temperature === 'Hot' &&
        d.ingredients['Ice Level'] &&
        !/no ice/i.test(d.ingredients['Ice Level'].ingredient_name)
      ) {
        alert(`Hot drinks must use the "No Ice" option for "${d.item.item_name}".`);
        return;
      }
    }

    // Helper to collect all ingredient IDs for a drink
    const collectIngredientIds = (drink: any) => {
      const ids: number[] = [];

      // Single-select categories (Milk, Ice, Size, Sweetness)
      Object.values(drink.ingredients).forEach((ing: any) => {
        if (ing && ing.ingredient_id) {
          ids.push(ing.ingredient_id);
        }
      });

      // Multi-select toppings/extras
      drink.extras.forEach((e: any) => {
        if (e && e.ingredient_id) {
          ids.push(e.ingredient_id);
        }
      });

      return ids;
    };

    const itemsPayload = cart.map((d: any) => {
      const extrasCost = d.extras.reduce(
        (s: number, e: any) => s + e.ingredient_cost,
        0,
      );
      const perDrink = d.item.item_cost + extrasCost;
      const lineTotal = perDrink * d.quantity;

      return {
        item_id: d.item.item_id,
        quantity: d.quantity,
        subtotal: lineTotal,
        // send all ingredient IDs (milk, ice, toppings, etc.)
        extras: collectIngredientIds(d),
      };
    });

    const body = {
      customerId: null, // or real id if you have it
      employeeId: null, // or real id
      items: itemsPayload,
      totalCost: itemsPayload.reduce((sum, x) => sum + x.subtotal, 0),
      tax: 0, // or your tax calc
      tip: 0, // or tip value
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error(data);
        alert(data.error || 'Failed to place order');
        return;
      }

      console.log('Order created:', data);
      alert('Order confirmed! Thank you.');
      setCart([]);
      setShowCheckoutPopup(false);
    } catch (err: any) {
      console.error(err);
      alert('Network error while creating order');
    }
  };

  return (
    <div className="orders-layout" style={{ display: 'flex', gap: '1rem' }}>
      <div
        className="items-container"
        style={{
          flex: 1,
          overflowY: 'auto',
          maxHeight: '90vh',
          padding: '1rem',
        }}
      >
        <CashierNavbar />

        {/* Dietary Filter */}
        <div
          className="dietary-filter"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}
        >
          <span>Dietary:</span>
          <select
            value={dietaryFilter}
            onChange={(e) =>
              setDietaryFilter(
                e.target.value as
                  | 'all'
                  | 'dairy_free'
                  | 'gluten_free'
                  | 'both_free'
              )
            }
            className="dietary-select"
          >
            <option value="all">All Items</option>
            <option value="dairy_free">Dairy-Free</option>
            <option value="gluten_free">Gluten-Free</option>
            <option value="both_free">Dairy &amp; Gluten Free</option>
          </select>
        </div>

        {/* Items grouped by category */}
        {categories.map((cat) => {
          let catItems;

          if (cat.category_id === 7) {
            // Misc items (Packaging ingredients)
            catItems = allowedMiscCategoryNames.flatMap(
              (catName) => groupedIngredients[catName] || []
            );
          } else {
            catItems = items
              .filter((i: any) => i.category_id === cat.category_id)
              .filter((item: any) => {
                const hasDairy = !!item.contains_dairy;
                const hasGluten = !!item.contains_gluten;

                switch (dietaryFilter) {
                  case 'dairy_free':
                    return !hasDairy;
                  case 'gluten_free':
                    return !hasGluten;
                  case 'both_free':
                    return !hasDairy && !hasGluten;
                  case 'all':
                  default:
                    return true;
                }
              });
          }

          if (!catItems.length) return null;

          return (
            <div key={cat.category_id} className="category-section" style={{ marginBottom: '2rem' }}>
              <h2>{cat.name}</h2>
              <div className="items-row" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {catItems.map((item: any) => {
                  const isMisc = cat.category_id === 7;

                  // NEW: determine if this item/ingredient is out of stock
                  const isOutOfStock = isMisc
                    ? item.supply_level !== undefined && item.supply_level <= 0
                    : !!item.has_oos_ingredient; // from /api/admin/items

                  // selection highlight for misc packaging already in cart
                  const isSelectedMisc =
                    isMisc &&
                    cart.some((d: any) =>
                      d.extras.some((ex: any) => ex.ingredient_id === item.ingredient_id)
                    );

                  return (
                    <button
                      key={item.item_id || item.ingredient_id}
                      onClick={() => {
                        if (isOutOfStock) return;
                        if (isMisc) {
                          addIngredient(item);
                        } else {
                          addDrink(item);
                        }
                      }}
                      disabled={isOutOfStock}
                      className={`item-card ${
                        isOutOfStock ? 'item-card-disabled' : ''
                      } ${
                        isSelectedMisc ? 'selected' : ''
                      }`}
                      style={{ width: '150px', textAlign: 'center' }}
                    >
                      <div className="thumb">
                        {item.photo || miscIngredientPhotos[item.ingredient_name] ? (
                          <img
                            src={item.photo || miscIngredientPhotos[item.ingredient_name]}
                            alt={item.item_name || item.ingredient_name}
                            style={{ width: '100%' }}
                          />
                        ) : (
                          <span className="thumb-ph">No image</span>
                        )}
                      </div>
                      <h3 className="item-name">{item.item_name || item.ingredient_name}</h3>
                      {item.item_cost != null && <p>${item.item_cost.toFixed(2)}</p>}

                      {/* NEW: Out of stock badge */}
                      {isOutOfStock && (
                        <div className="item-badge item-badge-oos" style={{
                          marginTop: '0.25rem',
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '999px',
                          backgroundColor: '#f97373',
                          color: 'white',
                          display: 'inline-block',
                        }}>
                          Out of stock
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* RIGHT SIDEBAR / CART */}
      <div 
        className="sidebar sidebar-right"
          style={{
          width: '350px',
          minWidth: '300px',
          flexShrink: 0,
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <h2 className="order-title">Current Order</h2>

        <div className="order-lines">
          {cart.length === 0 ? (
            <p className="empty muted">No items in cart</p>
          ) : (
            cart.map((d: any) => (
              <div
                key={d.cart_id}
                className="order-line"
                onClick={() => openCustomizationForDrink(d)}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <div className="order-line-title">{d.item.item_name}</div>
                  <div className="order-line-sub">
                    {Object.entries(d.ingredients).map(
                      ([cat, ing]: [string, any]) =>
                        ing ? (
                          <div key={cat}>
                            <span>{ing.ingredient_name}</span>
                          </div>
                        ) : null,
                    )}
                    {d.extras.map((e: any) => (
                      <div key={e.ingredient_id}>
                        {e.ingredient_name}{' '}
                        {e.ingredient_cost > 0
                          ? `(+$${e.ingredient_cost.toFixed(2)})`
                          : ''}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="order-line-amt">
                    <span className="order-line-total">
                      {(() => {
                        const extrasCost = d.extras.reduce(
                          (s: number, e: any) => s + e.ingredient_cost,
                          0,
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

        <button
          disabled={cart.length === 0}
          className="btn btn-checkout"
          onClick={() => setShowCheckoutPopup(true)}
        >
          Checkout
        </button>
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
                  0,
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
                            ing && <div key={cat}>{ing.ingredient_name}</div>,
                        )}
                        {d.extras.map((e: any) => (
                          <div key={e.ingredient_id}>
                            {e.ingredient_name}{' '}
                            {e.ingredient_cost > 0
                              ? `(+$${e.ingredient_cost.toFixed(2)})`
                              : ''}
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
              <button className="btn btn-primary" onClick={submitOrder}>
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
        <div
          className="customization-popup"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1500,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              width: '500px',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            <h3
              className="section-title"
              style={{ textAlign: 'center'}}
            >
              Customize {customizingDrink.item.item_name}
            </h3>
            <h5
              style={{
                marginTop: 0,
                marginBottom: '1rem',
                fontSize: '0.85rem',
                color: '#666',
                textAlign: 'center',
              }}
            >
              Fields marked <span style={{ color: 'red' }}>*</span> are required.
            </h5>

            {/* Temperature */}
            <div style={{ marginBottom: '1rem' }}>
              <h4>Temperature <span style={{ color: 'red' }}>*</span></h4>
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  className={`btn ${
                    customizingDrink.temperature === 'Hot' ? 'active' : ''
                  }`}
                  onClick={() => setTemperature('Hot')}
                >
                  Hot
                </button>
                <button
                  className={`btn ${
                    customizingDrink.temperature === 'Iced' ? 'active' : ''
                  }`}
                  onClick={() => setTemperature('Iced')}
                >
                  Iced
                </button>
              </div>
            </div>

            {/* Single-select ingredient groups */}
            {singleSelectCategories.map((cat) => (
              <div key={cat} style={{ marginBottom: '1rem' }}>
                <h4>{cat} <span style={{ color: 'red' }}>*</span></h4>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                  }}
                >
                  {groupedIngredients[cat]?.map((ing: any) => {
                    const isSelected =
                      customizingDrink.ingredients[cat]?.ingredient_id ===
                      ing.ingredient_id;

                    const isHot = customizingDrink.temperature === 'Hot';
                    const isIceCat = cat === 'Ice Level';
                    const isNotNoIce =
                      isIceCat && !/no ice/i.test(ing.ingredient_name);
                    const disabled = isHot && isIceCat && isNotNoIce;

                    return (
                      <button
                        key={ing.ingredient_id}
                        onClick={() => {
                          if (!disabled) setCustomizationOption(cat, ing);
                        }}
                        disabled={disabled}
                        className={`btn ${isSelected ? 'active' : ''} ${
                          disabled ? 'disabled' : ''
                        }`}
                      >
                        {ing.ingredient_name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Multi-select categories */}
            {multiSelectCategories.map((cat) =>
              groupedIngredients[cat] ? (
                <div key={cat} style={{ marginBottom: '1rem' }}>
                  <h4>{cat}</h4>
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    {groupedIngredients[cat].map((ing: any) => {
                      const isSelected = customizingDrink.extras.some(
                        (e: any) => e.ingredient_id === ing.ingredient_id
                      );
                      return (
                        <button
                          key={ing.ingredient_id}
                          onClick={() => toggleTopping(ing)}
                          className={`btn ${isSelected ? 'active' : ''}`}
                        >
                          {ing.ingredient_name}{' '}
                          {ing.ingredient_cost
                            ? `(+${ing.ingredient_cost.toFixed(2)})`
                            : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null
            )}

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button
                className="logout"
                onClick={confirmCustomization}
                style={{ marginRight: '1rem' }}
              >
                Confirm
              </button>
              <button className="btn" onClick={cancelCustomization}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
