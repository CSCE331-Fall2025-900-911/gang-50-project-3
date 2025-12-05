
// import React, { useEffect, useState } from 'react';
// import './MenuBoard.css';

// const singleSelectCategories = ['Milk', 'Ice Level', 'Sizes', 'Sweetness Level'];

// export default function MenuBoard() {
//   const [menuItems, setMenuItems] = useState<Record<string, any[]>>({});
//   const [ingredients, setIngredients] = useState<Record<string, any[]>>({});
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const itemsRes = await fetch('/api/items');
//         const itemsJson = await itemsRes.json();

//         const groupedItems: Record<string, any[]> = {};
//         itemsJson.forEach((item: any) => {
//           const cat = item.category_name;

//           // Remove "Other" AND skip items with missing category
//           if (!cat || cat === 'Other') return;

//           if (!groupedItems[cat]) groupedItems[cat] = [];
//           groupedItems[cat].push(item);
//         });

//         const ingRes = await fetch('/api/ingredients');
//         const ingJson = await ingRes.json();

//         const groupedIngredients: Record<string, any[]> = {};
//         ingJson.forEach((ing: any) => {
//           const cat = ing.ingredient_category_name;

//           if (cat === 'Other') return;

//           if (singleSelectCategories.includes(cat)) {
//             if (!groupedIngredients[cat]) groupedIngredients[cat] = [];
//             groupedIngredients[cat].push(ing);
//           }
//         });

//         setMenuItems(groupedItems);
//         setIngredients(groupedIngredients);
//         setLoading(false);
//       } catch (err) {
//         console.error(err);
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, []);

//   if (loading) return <p>Loading menu...</p>;

//   const menuColumns: Record<string, any[]> = { col1: [], col2: [], col3: [] };
//   Object.entries(menuItems).forEach(([cat, items], index) => {
//     if (index % 3 === 0) menuColumns.col1.push({ cat, items });
//     else if (index % 3 === 1) menuColumns.col2.push({ cat, items });
//     else menuColumns.col3.push({ cat, items });
//   });

//   return (
//     <div className="menu-board-container" style={{ display: 'flex', gap: '2%' }}>
//       <div className="menu-header-image" style={{ flex: 1 }}>
//         <img src="menu_image.png" alt="Menu Visual" className="main-menu-img" />
//       </div>

//       <div className="menu-content" style={{ flex: 2 }}>
//         <h1 className="menu-title">Menu Board</h1>

//         <div className="menu-sections" style={{ display: 'flex', gap: '1%' }}>
//           <div className="menu-column col-1" style={{ flex: 1 }}>
//             {menuColumns.col1.map(({ cat, items }) => (
//               <MenuSection key={cat} title={cat} items={items} />
//             ))}
//           </div>
//           <div className="menu-column col-2" style={{ flex: 1 }}>
//             {menuColumns.col2.map(({ cat, items }) => (
//               <MenuSection key={cat} title={cat} items={items} />
//             ))}
//           </div>
//           <div className="menu-column col-3" style={{ flex: 1 }}>
//             {menuColumns.col3.map(({ cat, items }) => (
//               <MenuSection key={cat} title={cat} items={items} />
//             ))}
//           </div>
//         </div>

//         <div className="customization-bar">
//           {Object.entries(ingredients).map(([cat, items]) => (
//             <div key={cat} className="customization-group">
//               <span className="customization-label">{cat}</span>
//               <div className="options-row">
//                 {items.map((ing: any) => (
//                   <span key={ing.ingredient_ID} className="option-item">
//                     <span className="option-label">{ing.ingredient_name}</span>
//                   </span>
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// const MenuSection: React.FC<{ title: string; items: any[] }> = ({ title, items }) => (
//   <div className="menu-section">
//     <h3 className="section-title">{title}</h3>
//     <ul className="menu-list">
//       {items.map((item) => (
//         <li key={item.item_ID} className="menu-item">
//           <span>{item.item_name}</span>
//           {title == 'Special Items' &&  <span className="new-tag-inline">NEW</span>}
//         </li>
//       ))}
//     </ul>
//   </div>
// );



import React, { useEffect, useState } from 'react';
import './MenuBoard.css';

const singleSelectCategories = ['Milk', 'Ice Level', 'Sizes', 'Sweetness Level'];

// Dietary rules
const dietaryRules = {
  milkRequired: [
    'Classic Milk Tea','Taro Milk Tea','Matcha Pearl Milk Tea','Matcha Fresh Milk',
    'Strawberry Matcha Fresh Milk','Brown Sugar Boba','Thai Tea','Honeydew Milk Tea',
    'Rose Milk Tea','Wintermelon Milk Tea','Chocolate Milk Tea','Vanilla Milk Tea',
    'Coffee Milk Tea','Caramel Milk Tea','Hazelnut Latte',
    'Gingerbread Shake','Peppermint Mocha','Eggnog'
  ]
};

// Gluten detection
const isGluten = (itemName: string) => {
  const keywords = ['Pearl', 'Pudding'];
  return keywords.some((kw) => itemName.includes(kw));
};

export default function MenuBoard() {
  const [menuItems, setMenuItems] = useState<Record<string, any[]>>({});
  const [ingredients, setIngredients] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const itemsRes = await fetch('/api/items');
        if (!itemsRes.ok) throw new Error(`Failed to fetch items: ${itemsRes.status}`);
        const itemsJson = await itemsRes.json();

        const groupedItems: Record<string, any[]> = {};
        itemsJson.forEach((item: any) => {
          const cat = item.category_name || 'Uncategorized';
          if (!groupedItems[cat]) groupedItems[cat] = [];
          groupedItems[cat].push(item);
        });

        const ingRes = await fetch('/api/ingredients');
        if (!ingRes.ok) throw new Error(`Failed to fetch ingredients: ${ingRes.status}`);
        const ingJson = await ingRes.json();

        const groupedIngredients: Record<string, any[]> = {};
        ingJson.forEach((ing: any) => {
          const cat = ing.ingredient_category_name || 'Other';
          if (singleSelectCategories.map(c => c.toLowerCase()).includes(cat.toLowerCase())) {
            if (!groupedIngredients[cat]) groupedIngredients[cat] = [];
            groupedIngredients[cat].push(ing);
          }
        });

        setMenuItems(groupedItems);
        setIngredients(groupedIngredients);
        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <p>Loading menu...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  // Split items into 3 columns
  const menuColumns: Record<string, any[]> = { col1: [], col2: [], col3: [] };
  Object.entries(menuItems).forEach(([cat, items], index) => {
    if (index % 3 === 0) menuColumns.col1.push({ cat, items });
    else if (index % 3 === 1) menuColumns.col2.push({ cat, items });
    else menuColumns.col3.push({ cat, items });
  });

  return (
    <div className="menu-board-container" style={{ display: 'flex', gap: '2%' }}>
      <div className="menu-header-image" style={{ flex: 1 }}>
        <img src="menu_image.png" alt="Menu Visual" className="main-menu-img" />
      </div>

      <div className="menu-content" style={{ flex: 2 }}>
        <h1 className="menu-title">Menu Board</h1>

        <div className="menu-sections" style={{ display: 'flex', gap: '1%' }}>
          {[menuColumns.col1, menuColumns.col2, menuColumns.col3].map((col, idx) => (
            <div key={idx} className={`menu-column col-${idx + 1}`} style={{ flex: 1 }}>
              {col.map(({ cat, items }) => (
                <MenuSection key={cat} title={cat} items={items} />
              ))}
            </div>
          ))}
        </div>

        {Object.keys(ingredients).length > 0 && (
          <div className="customization-bar">
            {Object.entries(ingredients).map(([cat, items]) => (
              <div key={cat} className="customization-group">
                <span className="customization-label">{cat}</span>
                <div className="options-row">
                  {items.map((ing: any) => (
                    <span key={ing.ingredient_ID} className="option-item">
                      <span className="option-label">{ing.ingredient_name}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const MenuSection: React.FC<{ title: string; items: any[] }> = ({ title, items }) => (
  <div className="menu-section">
    <h3 className="section-title">{title}</h3>
    <ul className="menu-list">
      {items.map((item) => (
        <li key={item.menu_item_id} className="menu-item">
          <span>{item.name}</span>

          {/* Special Items Tag */}
          {title === 'Special Items' && <span className="new-tag-inline">NEW</span>}

          {/* Dietary Icons */}
          <span className="dietary-icons">
            {dietaryRules.milkRequired.includes(item.name) && (
              <span className="dietary-icon milk" title="Requires Milk">🥛</span>
            )}
            {isGluten(item.name) && (
              <span className="dietary-icon gluten" title="Contains Gluten">🌾</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  </div>
);
