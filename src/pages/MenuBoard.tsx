import React from 'react';
import './MenuBoard.css';

// Placeholder data - you would fetch this from your API
const menuData = {
  milkySeries: [
    { name: 'Classic Pearl Milk Tea', new: false },
    { name: 'Honey Pearl Milk Tea', new: false },
    { name: 'Coffee Creama', new: false },
    { name: 'Coffee Milk Tea w/ Coffee Jelly', new: false },
    { name: 'Hokkaido Pearl Milk Tea', new: false },
    { name: 'Thai Pearl Milk Tea', new: false },
    { name: 'Taro Pearl Milk Tea', new: false },
    { name: 'Mango Green Milk Tea', new: false },
    { name: 'Golden Retriever', new: true },
  ],
  freshBrew: [
    { name: 'Classic Tea', description: '(Black/Green/Oolong Tea)', new: false },
    { name: 'Honey Tea', description: '(Black/Green/Oolong Tea)', new: false },
  ],
  fruityBeverage: [
    { name: 'Mango Green Tea', new: false },
    { name: 'Passion Chess', new: true },
    { name: 'Berry Lychee Burst', new: true },
    { name: 'Peach Tea w/ Honey Jelly', description: '(Black/Green/Oolong Tea)', new: false },
    { name: 'Mango & Passion Fruit Tea', new: false },
    { name: 'Honeylemonade', new: true },
  ],
  nonCaffeinated: [
    { name: 'Tiger Boba', new: true },
    { name: 'Strawberry Coconut', new: true },
    { name: 'Strawberry Coconut Ice Blended', new: true },
    { name: 'Halo Halo', new: true },
    { name: 'Halo Halo Ice Blended', new: true },
    { name: 'Wintermelon Lemonade', new: false },
    { name: 'Wintermelon Lemonade Ice Blended', new: true },
    { name: 'Wintermelon w/ Fresh Milk', new: true },
  ],
  newMatchaSeries: [
    { name: 'Matcha Pearl Milk Tea', new: false },
    { name: 'Matcha Fresh Milk', new: false },
    { name: 'Strawberry Matcha Fresh Milk', new: false },
    { name: 'Mango Matcha Fresh Milk', new: false },
    { name: 'Matcha Ice Blended', new: false },
  ],
  iceBlended: [
    { name: 'Oreo w/ Pearl', new: false },
    { name: 'Taro w/ Pudding', new: false },
    { name: 'Thai Tea w/ Pearl', new: false },
    { name: 'Coffee w/ Ice Cream', new: false },
    { name: 'Mango w/ Ice Cream', new: false },
    { name: 'Strawberry w/ Lychee Jelly & Ice Cream', new: false },
    { name: 'Peach Tea w/ Lychee Jelly', new: false },
    { name: 'Lava Flow', new: true },
  ],
};

const customizationOptions = {
  iceLevel: [
    { label: 'Regular', value: '100%' },
    { label: 'Less', value: '80%' },
    { label: 'No Ice', value: '0%' },
  ],
  sweetnessLevel: [
    { label: 'Normal', value: '100%' },
    { label: 'Less', value: '80%' },
    { label: 'Half', value: '50%' },
    { label: 'Light', value: '30%' },
    { label: 'No Sugar', value: '0%' },
  ],
  topping: [
    { name: 'Pearls (Boba)' },
    { name: 'Jelly' },
    { name: 'Coffee Jelly' },
    { name: 'Honey Jelly' },
    { name: 'Crystal Boba' },
    { name: 'Mango/Popping Boba' },
    { name: 'Strawberry Popping Boba' },
    { name: 'Ice Cream' },
    { name: 'Creama' },
  ],
};


export default function MenuBoard() {
  return (
    <div className="menu-board-container">
      <h1 className="menu-title">Menu Board</h1>
      <div className="menu-header-image">
        {/* Placeholder for the main image with text "SWIRL INTO HAPPINESS" */}
        <div className="header-text-overlay">
          <p className="swirl-text">SWIRL INTO</p>
          <p className="happiness-text">HAPPINESS</p>
          <p className="tagline">THE FIRST AND BEST SIP</p>
          <p className="taste-tagline">Taste the Joy!</p>
        </div>
        <img src="https://via.placeholder.com/300x700?text=Sharetea+Menu+Image" alt="Sharetea Menu Visual" className="main-menu-img" />
        <div className="drink-overlay-strawberry">
            <span className="new-tag">NEW</span>
            <span className="drink-name-overlay">Strawberry Coconut</span>
            <span className="drink-type-overlay">Ice Blended</span>
        </div>
        <div className="drink-overlay-matcha">
            <span className="new-tag">NEW</span>
            <span className="drink-name-overlay">Matcha</span>
            <span className="drink-type-overlay">Ice Blended</span>
        </div>
      </div>

      <div className="menu-sections">
        <div className="menu-column col-1">
          <MenuSection title="MILKY SERIES" items={menuData.milkySeries} />
          <MenuSection title="FRESH BREW" items={menuData.freshBrew} />
        </div>

        <div className="menu-column col-2">
          <MenuSection title="FRUITY BEVERAGE" items={menuData.fruityBeverage} />
          <MenuSection title="NON-CAFFEINATED" items={menuData.nonCaffeinated} />
        </div>

        <div className="menu-column col-3">
          <MenuSection title="NEW MATCHA SERIES" items={menuData.newMatchaSeries} />
          <MenuSection title="ICE-BLENDED" items={menuData.iceBlended} />
        </div>
      </div>

      <div className="customization-bar">
        <div className="customization-group">
          <span className="customization-label">ICE LEVEL</span>
          <div className="options-row">
            {customizationOptions.iceLevel.map((opt, index) => (
              <span key={index} className="option-item">
                <span className="option-label">{opt.label}</span>
                <span className="option-value">{opt.value}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="customization-group">
          <span className="customization-label">SWEETNESS LEVEL</span>
          <div className="options-row">
            {customizationOptions.sweetnessLevel.map((opt, index) => (
              <span key={index} className="option-item">
                <span className="option-label">{opt.label}</span>
                <span className="option-value">{opt.value}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="customization-group topping-group">
          <span className="customization-label">TOPPING</span>
          <div className="options-row">
            {customizationOptions.topping.map((opt, index) => (
              <span key={index} className="option-item-topping">{opt.name}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for rendering a menu section
const MenuSection: React.FC<{ title: string; items: any[] }> = ({ title, items }) => (
  <div className="menu-section">
    <h3 className="section-title">{title}</h3>
    <ul className="menu-list">
      {items.map((item, index) => (
        <li key={index} className="menu-item">
          <span>{item.name}</span>
          {item.description && <span className="item-description">{item.description}</span>}
          {item.new && <span className="new-tag-inline">NEW</span>}
        </li>
      ))}
    </ul>
  </div>
);