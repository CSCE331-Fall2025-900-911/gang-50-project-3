import { useState, useEffect } from 'react';
import KioskNavbar from '../components/KioskNavbar';
import DiscountWheel from '../components/DiscountWheel';

export default function Kiosk() {
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [_employeeId] = useState(1);

  // Checkout & discount state
  const [showCheckoutPopup, setShowCheckoutPopup] = useState(false);
  const [showDiscountPopup, setShowDiscountPopup] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch(`/api/categories`);
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

  useEffect(() => {
    const loadItems = async () => {
      try {
        const res = await fetch(`/api/items`);
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

  if (error) {
    return (
      <div className="error-screen">
        <KioskNavbar />
        <div className="error-container" style={{ textAlign: 'center', marginTop: '3rem' }}>
          <h2>Something went wrong </h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn">Retry</button>
        </div>
      </div>
    );
  }

  const filteredItems = selectedCategory
    ? items.filter((item) => item.category_id === selectedCategory)
    : [];

  const addToCart = (item: any) => {
    setCart((prev) => [
      ...prev,
      { ...item, cart_id: Date.now(), quantity: 1, customization: 'Regular' },
    ]);
  };

  const removeFromCart = (cartId: number) => {
    setCart((prev) => prev.filter((i) => i.cart_id !== cartId));
  };

  const subtotal = cart.reduce((sum, i) => sum + i.item_cost * i.quantity, 0);

  const discountedSubtotal = subtotal * (1 - appliedDiscount / 100);
  const discountedTax = discountedSubtotal * 0.08;
  const discountedTotal = discountedSubtotal + discountedTax;

  const selectedCategoryName =
    categories.find((c) => c.category_id === selectedCategory)?.name || 'Items';

  return (
    <div className="orders-layout">
      {/* left sidebar */}
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

      {/* menu items */}
      <div className="content">
        <KioskNavbar />
        <h2 className="section-title">{selectedCategoryName}</h2>
        {filteredItems.length === 0 ? (
          <p className="empty muted">No items found</p>
        ) : (
          <div className="item-grid">
            {filteredItems.map((item) => (
              <button
                key={item.item_id}
                onClick={() => addToCart(item)}
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

      {/* checkout */}
      <div className="sidebar sidebar-right">
        <h2 className="order-title">Current Order</h2>
        {cart.length === 0 ? (
          <p className="empty muted">No items in cart</p>
        ) : (
          cart.map((item) => (
            <div key={item.cart_id} className="order-line">
              <div>
                <div className="order-line-title">{item.item_name}</div>
                <div className="order-line-sub">{item.customization}</div>
              </div>
              <div className="order-line-amt">
                <span className="order-line-total">
                  ${(item.item_cost * item.quantity).toFixed(2)}
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

        {/* totals */}
        <div className="totals-card">
          <div className="totals-row">
            <span>Subtotal</span>
            <span style={{ textDecoration: appliedDiscount > 0 ? 'line-through' : 'none' }}>
              ${subtotal.toFixed(2)}
            </span>
          </div>

          {appliedDiscount > 0 && (
            <div className="totals-row" style={{ color: 'green', fontWeight: 'bold' }}>
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

      {/* checkout popup */}
      {showCheckoutPopup && (
        <div
          className="checkout-popup"
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
            zIndex: 1000,
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
            <h3 style={{ marginBottom: '1rem' }}>Review Your Order</h3>

            {cart.map((item) => (
              <div key={item.cart_id} style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                <strong>{item.item_name}</strong> - ${item.item_cost.toFixed(2)}
                <div style={{ paddingLeft: '1rem', marginTop: '0.25rem' }}>{item.customization}</div>
              </div>
            ))}

            <div style={{ borderTop: '2px solid #000', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <span style={{ textDecoration: appliedDiscount > 0 ? 'line-through' : 'none' }}>${subtotal.toFixed(2)}</span>
              </div>

              {appliedDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'green', fontWeight: 'bold' }}>
                  <span>Discount ({appliedDiscount}%):</span>
                  <span>- ${(subtotal - discountedSubtotal).toFixed(2)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>New Subtotal:</span>
                <span>${discountedSubtotal.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tax:</span>
                <span>${discountedTax.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>Total:</span>
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

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button
                className="btn"
                style={{ marginRight: '1rem' }}
                onClick={() => {
                  alert("Order confirmed! Thank you.");
                  setCart([]);
                  setAppliedDiscount(0);
                  setShowCheckoutPopup(false);
                }}
              >
                Confirm
              </button>
              <button className="btn" onClick={() => setShowCheckoutPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* discount wheel popup */}
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
    </div>
  );
}
