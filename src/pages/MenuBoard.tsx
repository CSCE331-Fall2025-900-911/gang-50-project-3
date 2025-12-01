import React from 'react';
import './MenuBoard.css';

const menuData = {
  milkySeries: [
    { name: 'Brown Sugar Boba', new: false },
    { name: 'Caramel Milk Tea', new: false },
    { name: 'Chocolate Milk Tea', new: false },
    { name: 'Coffee Milk Tea', new: false },
    { name: 'Hazelnut Latte', new: false },
    { name: 'Thai Milk Tea', new: false },
    { name: 'Taro Milk Tea', new: false },
    { name: 'Honeydew Milk Tea', new: false },
    { name: 'Rose Milk Tea', new: false },
    { name: 'Vanilla Milk Tea', new: false },
    { name: 'Wintermelon Milk Tea', new: false },
  ],

  freshBrew: [
    { name: 'Classic Tea', description: '(Black/Green/Oolong Tea)', new: false },
    { name: 'Honey Tea', description: '(Black/Green/Oolong Tea)', new: false },
    { name: 'Oolong Tea', new: false },
  ],

  fruityBeverage: [
    { name: 'Pinapple Green Tea', new: false },
    { name: 'Lychee Jasmine', new: false },
    { name: 'Peach Oolong', new: false },
    { name: 'Passion Fruit Tea', new: false },
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
    { name: 'Matcha Ice Blended', new: false },
  ],

  iceBlended: [
    { name: 'Oreo w/ Pearl', new: false },
    { name: 'Taro w/ Pudding', new: false },
    { name: 'Thai Tea w/ Pearl', new: false },
    { name: 'Coffee w/ Pearl', new: false },
    { name: 'Mango Slush', new: false },
    { name: 'Strawberry Smoothie', new: false },
  ],

  LimitedEdition: [
    { name: 'Eggnog', new: true },
    { name: 'Peppermint Mocha', new: true },
    { name: 'Gingerbread Shake', new: true },
  ],
};

const customizationOptions = {
  iceLevel: [
    { label: 'Regular', value: '100%' },
    { label: 'Less', value: '50%' },
    { label: 'No Ice', value: '0%' },
  ],

  sweetnessLevel: [
    { label: 'Regular', value: '100%' },
    { label: 'Less', value: '75%' },
    { label: 'Half', value: '50%' },
    { label: 'Light', value: '25%' },
    { label: 'No Sugar', value: '0%' },
  ],

  CupSizes: [
    { label: 'Medium', value: 'M' },
    { label: 'Large', value: 'L' },
    { label: 'Small', value: 'S' },
  ],

  MilkOptions: [
    { name: 'Whole Milk' },
    { name: '2% Milk' },
    { name: 'Non-Dairy Milk' },
  ],
};

export default function MenuBoard() {
  return (
    <div className="menu-board-container">
      <h1 className="menu-title">Menu Board</h1>

      <div className="menu-header-image">
        <img src="menu_image.png" alt="Sharetea Menu Visual" className="main-menu-img" />

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
      </div>
    </div>
  );
}

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
