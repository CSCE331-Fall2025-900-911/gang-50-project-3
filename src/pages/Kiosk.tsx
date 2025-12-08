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

  // Checkout & discount state
  const [showCheckoutPopup, setShowCheckoutPopup] = useState(false);
  const [showDiscountPopup, setShowDiscountPopup] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Customization state
  const [showCustomizationPopup, setShowCustomizationPopup] = useState(false);
  const [customizingDrink, setCustomizingDrink] = useState<any | null>(null);

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
  const filteredItems = selectedCategory
    ? items.filter((item: any) => item.category_id === selectedCategory)
    : [];

  const selectedCategoryName =
    categories.find((c: any) => c.category_id === selectedCategory)?.name || 'Items';

  // Add drink and immediately open customization
  const addDrink = (item: any) => {
    const newDrink = {
      cart_id: Date.now() + Math.random(),
      item,
      quantity: 1,
      temperature: 'Iced', // NEW: default temperature
      ingredients: {
        Milk: null,
        'Ice Level': null,
        Sizes: null,
        'Sweetness Level': null,
      },
      extras: [] as any[], // toppings + other add-ons
    };

    setCart(prev => [...prev, newDrink]);
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

    setCustomizingDrink({
      ...customizingDrink,
      ingredients: {
        ...customizingDrink.ingredients,
        [category]: isSame ? null : ing,
      },
    });
  };

  // Temperature handler
  const setTemperature = (temp: 'Hot' | 'Iced') => {
    if (!customizingDrink) return;
    setCustomizingDrink({
      ...customizingDrink,
      temperature: temp,
    });
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
    setCart(prev =>
      prev.map(d => (d.cart_id === customizingDrink.cart_id ? customizingDrink : d))
    );
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

  // ---------- UI ----------
  return (
    <div className="orders-layout">
      {/* LEFT SidEBAR */}
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
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="content">
        <KioskNavbar />
        <h2 className="section-title">{selectedCategoryName}</h2>

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

      {/* RIGHT SidEBAR / CART */}
      <div className="sidebar sidebar-right">
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
                            {e.ingredient_name} (+${e.ingredient_cost.toFixed(2)}), {' '}
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
                onClick={() => {
                  alert('Order confirmed! Thank you.');
                  setCart([]);
                  setAppliedDiscount(0);
                  setShowCheckoutPopup(false);
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
              style={{ textAlign: 'center', marginBottom: '1rem' }}
            >
              Customize {customizingDrink.item.item_name}
            </h3>

            {/* Temperature */}
            <div style={{ marginBottom: '1rem' }}>
              <h4>Temperature</h4>
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
                <h4>{cat}</h4>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                  }}
                >
                  {groupedIngredients[cat]?.map((ing: any) => (
                    <button
                      key={ing.ingredient_id}
                      onClick={() => setCustomizationOption(cat, ing)}
                      className={`btn ${
                        customizingDrink.ingredients[cat]?.ingredient_id ===
                        ing.ingredient_id
                          ? 'active'
                          : ''
                      }`}
                    >
                      {ing.ingredient_name}
                    </button>
                  ))}
                </div>
              </div>
            ))}

           {/* Multi-select categories */}
            {multiSelectCategories.map((cat) => (
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
                          {ing.ingredient_name} {ing.ingredient_cost ? `(+${ing.ingredient_cost.toFixed(2)})` : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null
            ))}

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
