import { useEffect, useState } from 'react';

type Group = {
  label: string;
  options: string[];
  multiple: boolean;
};

export type Item = {
  item_id: number;
  item_name: string;
  item_cost: number;
  photo?: string | null;
  category_id?: number;
  [k: string]: any;
};

const API_URL = '/api';

export default function Customization({
  item,
  onClose,
  onAddToCart,
}: {
  item: Item;
  onClose?: () => void;
  onAddToCart?: (cartItem: any) => void;
}) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch customization groups from backend (GET request only)
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const res = await fetch(`${API_URL}/ingredients?item_id=${item.item_id}`);
        if (!res.ok) throw new Error('Failed to fetch customization options');
        const data: Group[] = await res.json();
        setGroups(data);
      } catch (err) {
        console.error(err);
        setError('Could not load customization options.');
      }
    };
    loadGroups();
  }, [item]);

  const handleOptionClick = (group: Group, option: string) => {
    setSelectedOptions(prev => {
      if (!group.multiple) {
        const otherOptions = group.options.filter(o => o !== option);
        const withoutOtherGroup = prev.filter(p => !otherOptions.includes(p));
        return withoutOtherGroup.includes(option)
          ? withoutOtherGroup.filter(p => p !== option)
          : [...withoutOtherGroup, option];
      } else {
        return prev.includes(option) ? prev.filter(p => p !== option) : [...prev, option];
      }
    });
  };

  const buildCartItem = () => ({
    ...item,
    cart_id: Date.now(),
    quantity: 1,
    customization: selectedOptions.length ? selectedOptions.join(', ') : 'Regular',
  });

  const handleConfirm = () => {
    setBusy(true);
    setStatusMessage(null);
    const cartItem = buildCartItem();

    try {
      const existing = JSON.parse(localStorage.getItem('cart') || '[]');
      localStorage.setItem('cart', JSON.stringify([...existing, cartItem]));
      if (onAddToCart) onAddToCart(cartItem);
      setStatusMessage('Added to cart.');
    } catch (err) {
      console.error(err);
      setStatusMessage('Failed to add to cart.');
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <div style={{ padding: '1rem' }}>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="content">
      <h2>{item.item_name}</h2>

      {groups.map(group => (
        <div key={group.label} style={{ marginBottom: '1rem' }}>
          <h3>{group.label}</h3>
          <div className="item-grid">
            {group.options.map(option => {
              const active = selectedOptions.includes(option);
              return (
                <button
                  key={option}
                  onClick={() => handleOptionClick(group, option)}
                  className={`item-card ${active ? 'active' : ''}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <button onClick={handleConfirm} disabled={busy}>
        {busy ? 'Working...' : 'Confirm'}
      </button>
      <button onClick={onClose}>Cancel</button>
      {statusMessage && <p>{statusMessage}</p>}
    </div>
  );
}