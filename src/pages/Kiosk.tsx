import { useState, useEffect } from 'react';
import KioskNavbar from '../components/KioskNavbar';
import DiscountWheel from '../components/DiscountWheel';

export default function Kiosk() {
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const API_URL = '/api';

  // Single-select ingredient categories
  const singleSelectCategories = ['Milk', 'Ice Level', 'Sizes', 'Sweetness Level'];
  // Multi-select category for toppings
  const multiSelectCategories = ['Toppings'];

  // NEW: required categories for a valid drink
  const REQUIRED_CATEGORIES = ['Milk', 'Sizes', 'Sweetness Level', 'Ice Level'];

  // Checkout & discount state
  const [showCheckoutPopup, setShowCheckoutPopup] = useState(false);
  const [showDiscountPopup, setShowDiscountPopup] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Customization state
  const [showCustomizationPopup, setShowCustomizationPopup] = useState(false);
  const [customizingDrink, setCustomizingDrink] = useState<any | null>(null);

  // Dietary restrictions
  const [dietaryFilter, setDietaryFilter] = useState<
    'all' | 'dairy_free' | 'gluten_free' | 'both_free'
  >('all');

  // which section's info popup is open
  const [infoSection, setInfoSection] = useState<null | 'left' | 'center' | 'right'>(null);

  // Error state for customization
  const [customizationError, setCustomizationError] = useState<string | null>(null);

  // ---------- Load categories, items, ingredients ----------
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
        <KioskNavbar />
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

  // ---------- Group ingredients by category ----------
  const groupedIngredients: Record<string, any[]> = {};
  for (const ingRaw of ingredients) {
    const ing = ingRaw as any;
    const catName = ing.ingredient_category_name || 'Other';
    if (!groupedIngredients[catName]) groupedIngredients[catName] = [];
    groupedIngredients[catName].push(ing);
  }
  Object.keys(groupedIngredients).forEach(catName => {
    groupedIngredients[catName].sort((a: any, b: any) =>
      a.ingredient_name.localeCompare(b.ingredient_name)
    );
  });

  // ---------- Helpers ----------

  // Filter normal items with dietary filter
  const filteredItems = selectedCategory === 7
    ? []
    : items
      .filter((item: any) => item.category_id === selectedCategory)
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

  const selectedCategoryName =
    categories.find((c: any) => c.category_id === selectedCategory)?.name || 'Items';

  // Add drink and immediately open customization
  const addDrink = (item: any) => {
    const newDrink = {
      item,
      quantity: 1,
      temperature: 'Iced', // default temperature
      ingredients: {
        Milk: null,
        'Ice Level': null,
        Sizes: null,
        'Sweetness Level': null,
      },
      extras: [] as any[], // toppings + other add-ons
    };

    setCustomizingDrink(newDrink);
    setShowCustomizationPopup(true);
  };

  const removeDrink = (drinkId: number) => {
    setCart(prev => prev.filter((d: any) => d.cart_id !== drinkId));
  };

  const changeQuantity = (drinkId: number, delta: number) => {
    setCart(prev =>
      prev.map((d: any) => {
        if (d.cart_id !== drinkId) return d;
        const newQty = d.quantity + delta;
        return { ...d, quantity: newQty < 1 ? 1 : newQty };
      })
    );
  };

  // --- Pricing (includes extra cost) ---
  const subtotal = cart.reduce((sum: number, d: any) => {
    const extrasCost = d.extras.reduce(
      (s: number, e: any) => s + e.ingredient_cost,
      0
    );
    const perDrink = d.item.item_cost + extrasCost;
    return sum + perDrink * d.quantity;
  }, 0);

  const discountedSubtotal = subtotal * (1 - appliedDiscount / 100);
  const discountedTax = discountedSubtotal * 0.08;
  const discountedTotal = discountedSubtotal + discountedTax;

  // --- Customization Handlers ---

  // Single-select options (Sizes, Milk, Ice, Sweetness)
  const setCustomizationOption = (category: string, ing: any) => {
    if (!customizingDrink) return;

    const current = customizingDrink.ingredients[category];
    const isSame =
      current && current.ingredient_id === ing.ingredient_id;

    // NEW: block non-"No Ice" options if drink is Hot
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

    setCustomizationError(null);
  };

  // Temperature handler
  const setTemperature = (temp: 'Hot' | 'Iced') => {
    if (!customizingDrink) return;

    let updatedIngredients = { ...customizingDrink.ingredients };

    // NEW: if Hot, force Ice Level = "No Ice" (if available)
    if (temp === 'Hot') {
      const iceOptions = groupedIngredients['Ice Level'] || [];
      const noIceOption = iceOptions.find((ing: any) =>
        /no ice/i.test(ing.ingredient_name)
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
    setCustomizationError(null);
  };

  // Multi-select toppings -> stored in extras
  const toggleTopping = (ing: any) => {
    if (!customizingDrink) return;

    const exists = customizingDrink.extras.some(
      (e: any) => e.ingredient_id === ing.ingredient_id
    );

    const newExtras = exists
      ? customizingDrink.extras.filter(
          (e: any) => e.ingredient_id !== ing.ingredient_id
        )
      : [...customizingDrink.extras, ing];

    setCustomizingDrink({
      ...customizingDrink,
      extras: newExtras,
    });
  };

  const confirmCustomization = () => {
    if (!customizingDrink) return;

    // Required checks
    for (const cat of REQUIRED_CATEGORIES) {
      if (!customizingDrink.ingredients[cat]) {
        setCustomizationError(`Please select a ${cat}.`);
        return;
      }
    }

    // Hot drinks require No Ice
    const ice = customizingDrink.ingredients['Ice Level'];
    if (
      customizingDrink.temperature === 'Hot' &&
      ice &&
      !/no ice/i.test(ice.ingredient_name)
    ) {
      setCustomizationError(`Hot drinks must use "No Ice".`);
      return;
    }

    // If everything is valid:
    setCustomizationError(null);

    setCart(prev => {
      if (customizingDrink.cart_id != null) {
        return prev.map(d =>
          d.cart_id === customizingDrink.cart_id ? customizingDrink : d
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

  const submitOrder = async () => {
    if (cart.length === 0) return;

    // NEW: validate every drink before submitting
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
        0
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
      customerId: null,        // or real id if you have it
      employeeId: null,        // or real id
      items: itemsPayload,
      totalCost: itemsPayload.reduce((sum, x) => sum + x.subtotal, 0),
      tax: 0,                  // or your tax calc
      tip: 0,                  // or tip value
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
      setAppliedDiscount(0);
      setShowCheckoutPopup(false);
    } catch (err: any) {
      console.error(err);
      alert('Network error while creating order');
    }
  };

  // ---------- Info modal content ----------
  const getInfoContent = () => {
    switch (infoSection) {
      case 'left':
        return {
          title: 'Item Categories',
          body:
            'Use this panel to browse our drink categories. Tap a category, like Fresh Brew or Milk Tea, to see those items in the middle section.',
        };
      case 'center':
        return {
          title: 'Drink Selection',
          body:
            'This section shows drinks for the selected category. Tap a drink to customize options like size, milk, sweetness, and toppings before adding it to your order. You can also filter items by dietary needs.',
        };
      case 'right':
        return {
          title: 'Current Order',
          body:
            'This is your shopping cart. Each line shows a drink, its customizations, and price. Tap a drink to edit it, use +/− to change quantity, or the × button to remove it. Totals update automatically, including discounts and tax.',
        };
      default:
        return { title: '', body: '' };
    }
  };

  // ---------- UI ----------
  return (
    <div className="orders-layout">
      {/* LEFT Sidebar */}
      <div className="sidebar sidebar-left">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem',
          }}
        >
          <h2>Item Categories</h2>
          <img onClick={() => setInfoSection('left')} src="/Info.svg" alt="Info Icon" style={{ width: 25, height: 25 }} />
        </div>

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
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="content">
        <KioskNavbar />
        <div
          className="section-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2>{selectedCategoryName}</h2>
            <img onClick={() => setInfoSection('center')} src="/Info.svg" alt="Info Icon" style={{ width: 25, height: 25 }} />
          </div>

          <div
            className="dietary-filter"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <span style={{ fontSize: '0.9rem' }}>Dietary:</span>
            <select
              value={dietaryFilter}
              onChange={(e) =>
                setDietaryFilter(
                  e.target.value as 'all' | 'dairy_free' | 'gluten_free' | 'both_free'
                )
              }
              className="dietary-select"
            >
              <option value="all">All Items</option>
              <option value="dairy_free">Dairy-Free</option>
              <option value="gluten_free">Gluten-Free</option>
              <option value="both_free">Dairy & Gluten Free</option>
            </select>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <p className="empty muted">No items found.</p>
        ) : (
          <div className="item-grid">
            {filteredItems.map((item: any) => (
              <button
                key={item.item_id}
                onClick={() => addDrink(item)}
                className="item-card"
              >
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
        )}
      </div>

      {/* RIGHT Sidebar / CART */}
      <div className="sidebar sidebar-right">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem',
          }}
        >
          <h2 className="order-title">Current Order</h2>
          <img onClick={() => setInfoSection('right')} src="/Info.svg" alt="Info Icon" style={{ width: 25, height: 25 }} />
        </div>

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
                    {d.temperature && (
                      <div>
                        <span>{d.temperature}</span>
                      </div>
                    )}
                    {Object.entries(d.ingredients).map(
                      ([cat, ing]: [string, any]) =>
                        ing ? (
                          <div key={cat}>
                            <span>{ing.ingredient_name}</span>
                          </div>
                        ) : null
                    )}
                    {d.extras.length > 0 && (
                      <div>
                        {d.extras.map((e: any) => (
                          <span key={e.ingredient_id}>
                            {e.ingredient_name} (+${e.ingredient_cost.toFixed(2)}),{' '}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
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

        {/* Totals w/ discount */}
        <div className="totals-card">
          <div className="totals-row">
            <span>Subtotal</span>
            <span
              style={{
                textDecoration: appliedDiscount > 0 ? 'line-through' : 'none',
              }}
            >
              ${subtotal.toFixed(2)}
            </span>
          </div>

          {appliedDiscount > 0 && (
            <div
              className="totals-row"
              style={{ color: 'green', fontWeight: 'bold' }}
            >
              <span>Discount ({appliedDiscount}%):</span>
              <span>- ${(subtotal - discountedSubtotal).toFixed(2)}</span>
            </div>
          )}

          <div className="totals-row">
            <span>New Subtotal</span>
            <span>${discountedSubtotal.toFixed(2)}</span>
          </div>

          <div className="totals-row">
            <span>Tax</span>
            <span>${discountedTax.toFixed(2)}</span>
          </div>

          <div className="totals-row totals-row-total">
            <span>Total</span>
            <span>${discountedTotal.toFixed(2)}</span>
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

      {/* CHECKOUT POPUP (with discount math) */}
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

                    <div className="checkout-line-main">
                      <span className="checkout-line-name">
                        {d.item.item_name}
                      </span>

                      <div className="checkout-line-ingredients">
                        {d.temperature && (
                          <div>{d.temperature}</div>
                        )}
                        {Object.entries(d.ingredients).map(
                          ([cat, ing]: [string, any]) =>
                            ing && (
                              <div key={cat}>
                                {ing.ingredient_name}
                              </div>
                            )
                        )}
                        {d.extras.map((e: any) => (
                          <div key={e.ingredient_id}>
                            {e.ingredient_name} (+${e.ingredient_cost.toFixed(2)})
                          </div>
                        ))}
                      </div>
                    </div>

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

            <div className="checkout-summary">
              <div className="checkout-summary-row">
                <span>Subtotal</span>
                <span
                  style={{
                    textDecoration:
                      appliedDiscount > 0 ? 'line-through' : 'none',
                  }}
                >
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              {appliedDiscount > 0 && (
                <div
                  className="checkout-summary-row"
                  style={{ color: 'green', fontWeight: 'bold' }}
                >
                  <span>Discount ({appliedDiscount}%):</span>
                  <span>
                    - ${(subtotal - discountedSubtotal).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="checkout-summary-row">
                <span>New Subtotal</span>
                <span>${discountedSubtotal.toFixed(2)}</span>
              </div>
              <div className="checkout-summary-row">
                <span>Tax</span>
                <span>${discountedTax.toFixed(2)}</span>
              </div>
              <div className="checkout-summary-row checkout-summary-total">
                <span>Total</span>
                <span>${discountedTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              className="btn"
              style={{ marginTop: '1rem', width: '100%' }}
              onClick={() => setShowDiscountPopup(true)}
            >
              Spin for Discount
            </button>

            <div className="checkout-actions">
              <button
                className="btn btn-primary"
                onClick={submitOrder}
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

      {/* DISCOUNT WHEEL POPUP */}
      {showDiscountPopup && (
        <div
          className="discount-popup"
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
            zIndex: 2000,
          }}
        >
          <div
            className="discount-modal"
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              width: '400px',
              textAlign: 'center',
            }}
          >
            <h3>Spin the Wheel for a Discount!</h3>

            <DiscountWheel
              onComplete={(discount) => {
                setAppliedDiscount(discount);
                setShowDiscountPopup(false);
              }}
            />

            <button
              className="btn"
              style={{ marginTop: '1rem' }}
              onClick={() => setShowDiscountPopup(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* CUSTOMIZATION POPUP */}
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

            {customizationError && (
              <div style={{
                color: 'red',
                marginBottom: '1rem',
                fontSize: '0.9rem',
                textAlign: 'center'
              }}>
                {customizationError}
              </div>
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

      {/* INFO POPUP (for left/center/right sections) */}
      {infoSection && (
        <div
          className="info-backdrop"
          onClick={() => setInfoSection(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2500,
          }}
        >
          <div
            className="info-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              padding: '1.5rem 2rem',
              borderRadius: '8px',
              maxWidth: '420px',
              width: '90%',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            }}
          >
            {(() => {
              const { title, body } = getInfoContent();
              return (
                <>
                  <h3 style={{ marginBottom: '0.75rem' }}>{title}</h3>
                  <p style={{ marginBottom: '1.5rem', lineHeight: 1.5 }}>{body}</p>
                </>
              );
            })()}
            <div style={{ textAlign: 'right' }}>
              <button
                className="btn"
                onClick={() => setInfoSection(null)}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
