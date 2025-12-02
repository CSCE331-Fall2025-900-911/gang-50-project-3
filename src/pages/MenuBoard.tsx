// import React from 'react';
// import './MenuBoard.css';

// const menuData = {
//   milkySeries: [
//     { name: 'Brown Sugar Boba', new: false },
//     { name: 'Caramel Milk Tea', new: false },
//     { name: 'Chocolate Milk Tea', new: false },
//     { name: 'Coffee Milk Tea', new: false },
//     { name: 'Hazelnut Latte', new: false },
//     { name: 'Thai Milk Tea', new: false },
//     { name: 'Taro Milk Tea', new: false },
//     { name: 'Honeydew Milk Tea', new: false },
//     { name: 'Rose Milk Tea', new: false },
//     { name: 'Vanilla Milk Tea', new: false },
//     { name: 'Wintermelon Milk Tea', new: false },
//   ],

//   freshBrew: [
//     { name: 'Classic Tea', description: '(Black/Green/Oolong Tea)', new: false },
//     { name: 'Honey Tea', description: '(Black/Green/Oolong Tea)', new: false },
//     { name: 'Oolong Tea', new: false },
//   ],

//   fruityBeverage: [
//     { name: 'Pinapple Green Tea', new: false },
//     { name: 'Lychee Jasmine', new: false },
//     { name: 'Peach Oolong', new: false },
//     { name: 'Passion Fruit Tea', new: false },
//   ],

//   newMatchaSeries: [
//     { name: 'Matcha Pearl Milk Tea', new: false },
//     { name: 'Matcha Fresh Milk', new: false },
//     { name: 'Strawberry Matcha Fresh Milk', new: false },
//     { name: 'Matcha Ice Blended', new: false },
//   ],

//   iceBlended: [
//     { name: 'Oreo w/ Pearl', new: false },
//     { name: 'Taro w/ Pudding', new: false },
//     { name: 'Thai Tea w/ Pearl', new: false },
//     { name: 'Coffee w/ Pearl', new: false },
//     { name: 'Mango Slush', new: false },
//     { name: 'Strawberry Smoothie', new: false },
//   ],

//   LimitedEdition: [
//     { name: 'Eggnog', new: true },
//     { name: 'Peppermint Mocha', new: true },
//     { name: 'Gingerbread Shake', new: true },
//   ],
// };

// const customizationOptions = {
//   iceLevel: [
//     { label: 'Regular', value: '100%' },
//     { label: 'Less', value: '50%' },
//     { label: 'No Ice', value: '0%' },
//   ],

//   sweetnessLevel: [
//     { label: 'Regular', value: '100%' },
//     { label: 'Less', value: '75%' },
//     { label: 'Half', value: '50%' },
//     { label: 'Light', value: '25%' },
//     { label: 'No Sugar', value: '0%' },
//   ],

//   CupSizes: [
//     { label: 'Medium', value: 'M' },
//     { label: 'Large', value: 'L' },
//     { label: 'Small', value: 'S' },
//   ],

//   MilkOptions: [
//     { name: 'Whole Milk' },
//     { name: '2% Milk' },
//     { name: 'Non-Dairy Milk' },
//   ],
// };

// export default function MenuData() {
//   return (
//     <div className="menu-board-container">
//       <h1 className="menu-title">Menu Board</h1>

//       <div className="menu-header-image">
//         <img
//           src="menu_image.png"
//           alt="Sharetea Menu Visual"
//           className="main-menu-img"
//         />
//       </div>

//       <div className="menu-sections">
//         <div className="menu-column col-1">
//           <MenuSection title="MILKY SERIES" items={menuData.milkySeries} />
//           <MenuSection title="FRESH BREW" items={menuData.freshBrew} />
//         </div>

//         <div className="menu-column col-2">
//           <MenuSection title="FRUITY BEVERAGE" items={menuData.fruityBeverage} />
//           <MenuSection title="LIMITED EDITION" items={menuData.LimitedEdition} />
//         </div>

//         <div className="menu-column col-3">
//           <MenuSection title="NEW MATCHA SERIES" items={menuData.newMatchaSeries} />
//           <MenuSection title="ICE-BLENDED" items={menuData.iceBlended} />
//         </div>
//       </div>

//       <div className="customization-bar">
//         {/* ICE LEVEL */}
//         <div className="customization-group">
//           <span className="customization-label">ICE LEVEL</span>
//           <div className="options-row">
//             {customizationOptions.iceLevel.map((opt, index) => (
//               <span key={index} className="option-item">
//                 <span className="option-label">{opt.label}</span>
//                 <span className="option-value">{opt.value}</span>
//               </span>
//             ))}
//           </div>
//         </div>

//         {/* SWEETNESS LEVEL */}
//         <div className="customization-group">
//           <span className="customization-label">SWEETNESS LEVEL</span>
//           <div className="options-row">
//             {customizationOptions.sweetnessLevel.map((opt, index) => (
//               <span key={index} className="option-item">
//                 <span className="option-label">{opt.label}</span>
//                 <span className="option-value">{opt.value}</span>
//               </span>
//             ))}
//           </div>
//         </div>

//         {/* CUP SIZE */}
//         <div className="customization-group">
//           <span className="customization-label">CUP SIZE</span>
//           <div className="options-row">
//             {customizationOptions.CupSizes.map((opt, index) => (
//               <span key={index} className="option-item">
//                 <span className="option-label">{opt.label}</span>
//               </span>
//             ))}
//           </div>
//         </div>

//         {/* MILK OPTIONS */}
//         <div className="customization-group">
//           <span className="customization-label">MILK OPTIONS</span>
//           <div className="options-row">
//             {customizationOptions.MilkOptions.map((opt, index) => (
//               <span key={index} className="option-item">
//                 <span className="option-label">{opt.name}</span>
//               </span>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// const MenuSection: React.FC<{ title: string; items: any[] }> = ({ title, items }) => (
//   <div className="menu-section">
//     <h3 className="section-title">{title}</h3>
//     <ul className="menu-list">
//       {items.map((item, index) => (
//         <li key={index} className="menu-item">
//           <span>{item.name}</span>
//           {item.description && (
//             <span className="item-description">{item.description}</span>
//           )}
//           {item.new && <span className="new-tag-inline">NEW</span>}
//         </li>
//       ))}
//     </ul>
//   </div>
// );



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

export default function MenuData() {
  return (
    <div className="menu-board-container">
      {/* Left Image */}
      <div className="menu-header-image">
        <img
          src="menu_image.png"
          alt="Sharetea Menu Visual"
          className="main-menu-img"
        />
      </div>

      {/* Right Menu & Customizations */}
      <div className="menu-content">
        <h1 className="menu-title">Menu Board</h1>

        <div className="menu-sections">
          <div className="menu-column col-1">
            <MenuSection title="MILKY SERIES" items={menuData.milkySeries} />
            <MenuSection title="FRESH BREW" items={menuData.freshBrew} />
          </div>

          <div className="menu-column col-2">
            <MenuSection title="FRUITY BEVERAGE" items={menuData.fruityBeverage} />
            <MenuSection title="LIMITED EDITION" items={menuData.LimitedEdition} />
          </div>

          <div className="menu-column col-3">
            <MenuSection title="NEW MATCHA SERIES" items={menuData.newMatchaSeries} />
            <MenuSection title="ICE-BLENDED" items={menuData.iceBlended} />
          </div>
        </div>

        <div className="customization-bar">
          {/* ICE LEVEL */}
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

          {/* SWEETNESS LEVEL */}
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

          {/* CUP SIZE */}
          <div className="customization-group">
            <span className="customization-label">CUP SIZE</span>
            <div className="options-row">
              {customizationOptions.CupSizes.map((opt, index) => (
                <span key={index} className="option-item">
                  <span className="option-label">{opt.label}</span>
                </span>
              ))}
            </div>
          </div>

          {/* MILK OPTIONS */}
          <div className="customization-group">
            <span className="customization-label">MILK OPTIONS</span>
            <div className="options-row">
              {customizationOptions.MilkOptions.map((opt, index) => (
                <span key={index} className="option-item">
                  <span className="option-label">{opt.name}</span>
                </span>
              ))}
            </div>
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
          {item.description && (
            <span className="item-description">{item.description}</span>
          )}
          {item.new && <span className="new-tag-inline">NEW</span>}
        </li>
      ))}
    </ul>
  </div>
);

