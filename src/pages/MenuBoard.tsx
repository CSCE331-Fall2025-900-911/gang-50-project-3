// import React, { useEffect, useState } from 'react';
// import './MenuBoard.css';
// import { useNavigate } from 'react-router-dom';

// const singleSelectCategories = ['Milk', 'Ice Level', 'Sizes', 'Sweetness Level', 'Temperature'];
// const multiSelectCategories = ['Toppings'];

// // Gluten detection
// const isGluten = (itemName: string) => {
//   const keywords = ['Pearl', 'Pudding'];
//   return keywords.some((kw) => itemName.includes(kw));
// };

// // Milk detection based on category + exceptions
// const requiresMilk = (item: any) => {
//   const milkCategories = ['Milk Tea', 'Matcha Series', 'Special Items', 'Ice Blended'];
//   const category = item.category_name || '';
//   const name = item.item_name || '';
//   return milkCategories.includes(category) && !name.includes('Slush');
// };

// export default function MenuBoard() {
//   const [menuItems, setMenuItems] = useState<Record<string, any[]>>({});
//   const [ingredients, setIngredients] = useState<Record<string, any[]>>({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const navigate = useNavigate();

//   const handleLogout = () => {
//     document.documentElement.style.fontSize = '16px';
//     document.documentElement.style.filter = '';
//     localStorage.clear();
//     sessionStorage.clear();
//     navigate('/');
//   };

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const itemsRes = await fetch('/api/items');
//         if (!itemsRes.ok) throw new Error(`Failed to fetch items: ${itemsRes.status}`);
//         const itemsJson = await itemsRes.json();

//         const groupedItems: Record<string, any[]> = {};
//         itemsJson.forEach((item: any) => {
//           const cat = item.category_name || 'Uncategorized';
//           if (cat === 'Uncategorized') return;
//           if (!groupedItems[cat]) groupedItems[cat] = [];
//           groupedItems[cat].push(item);
//         });

//         const ingRes = await fetch('/api/ingredients');
//         if (!ingRes.ok) throw new Error(`Failed to fetch ingredients: ${ingRes.status}`);
//         const ingJson = await ingRes.json();

//         const groupedIngredients: Record<string, any[]> = {};
//         ingJson.forEach((ing: any) => {
//           const cat = ing.ingredient_category_name || 'Other';
//           if (
//             singleSelectCategories.map(c => c.toLowerCase()).includes(cat.toLowerCase()) ||
//             multiSelectCategories.map(c => c.toLowerCase()).includes(cat.toLowerCase())
//           ) {
//             if (!groupedIngredients[cat]) groupedIngredients[cat] = [];
//             groupedIngredients[cat].push(ing);
//           }
//         });

//         setMenuItems(groupedItems);
//         setIngredients(groupedIngredients);
//         setLoading(false);
//       } catch (err: any) {
//         console.error(err);
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, []);

//   if (loading) return <p>Loading menu...</p>;
//   if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

//   // Split items into 3 columns
//   const menuColumns: Record<string, any[]> = { col1: [], col2: [], col3: [] };
//   Object.entries(menuItems).forEach(([cat, items], index) => {
//     if (index % 3 === 0) menuColumns.col1.push({ cat, items });
//     else if (index % 3 === 1) menuColumns.col2.push({ cat, items });
//     else menuColumns.col3.push({ cat, items });
//   });

//   return (
//     <div className="menu-board-container" style={{ display: 'flex', gap: '2%' }}>
//       <div className="menu-header-image" style={{ flex: 1 }}>
//         <img src="menu_image(new).png" alt="Menu Visual" className="main-menu-img" />
//       </div>

//       <div className="menu-content" style={{ flex: 2, overflowY: 'auto' }}>
//         <h1 className="menu-title">Menu Board</h1>

//         {/* ICON LEGEND */}
//         <div className="icon-legend" style={{ display: 'flex', gap: '1em', marginBottom: '1%' }}>
//           <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '0.3em' }}>
//             <span className="dietary-icon milk">🥛</span>
//             <span>Contains Milk</span>
//           </div>
//           <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '0.3em' }}>
//             <span className="dietary-icon gluten">🌾</span>
//             <span>Contains Gluten</span>
//           </div>
//         </div>

//         {/* MENU COLUMNS */}
//         <div className="menu-sections" style={{ display: 'flex', gap: '1%' }}>
//           {[menuColumns.col1, menuColumns.col2, menuColumns.col3].map((col, idx) => (
//             <div key={idx} className={`menu-column col-${idx + 1}`} style={{ flex: 1 }}>
//               {col.map(({ cat, items }) => (
//                 <MenuSection key={cat} title={cat} items={items} />
//               ))}
//             </div>
//           ))}
//         </div>

//         {/* CUSTOMIZATION BAR (visual-only) */}
//         {Object.keys(ingredients).length > 0 && (
//           <div className="customization-bar">
//             {Object.entries(ingredients).map(([cat, items]) => (
//               <div key={cat} className="customization-group">
//                 <span className="customization-label">{cat}</span>
//                 <div className="options-row">
//                   {items.map((ing: any) => (
//                     <span key={ing.ingredient_id} className="option-item">
//                       <span className="option-label">{ing.ingredient_name}</span>
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         <button className="logout" onClick={handleLogout}>Back to Login</button>
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

//           {/* Special Items Tag */}
//           {title === 'Special Items' && <span className="new-tag-inline">NEW</span>}

//           {/* Dietary Icons */}
//           <span className="dietary-icons">
//             {requiresMilk(item) && (
//               <span className="dietary-icon milk" title="Contains Milk">🥛</span>
//             )}
//             {isGluten(item.item_name) && (
//               <span className="dietary-icon gluten" title="Contains Gluten">🌾</span>
//             )}
//           </span>

//           {/* Visual-only customization info */}
//           {item.customization?.temperature && (
//             <div className="menu-customization">Temperature: {item.customization.temperature}</div>
//           )}
//           {item.customization?.extras?.length > 0 && (
//             <div className="menu-customization">
//               Toppings: {item.customization.extras.map((e: any) => e.ingredient_name).join(', ')}
//             </div>
//           )}
//         </li>
//       ))}
//     </ul>
//   </div>
// );



// import React, { useEffect, useState } from 'react';
// import './MenuBoard.css';
// import { useNavigate } from 'react-router-dom';

// const singleSelectCategories = ['Milk', 'Ice Level', 'Sizes', 'Sweetness Level', 'Temperature'];
// const multiSelectCategories = ['Toppings'];

// // Gluten detection
// const isGluten = (itemName: string) => {
//   const keywords = ['Pearl', 'Pudding'];
//   return keywords.some((kw) => itemName.includes(kw));
// };

// // Milk detection based on category + exceptions
// const requiresMilk = (item: any) => {
//   const milkCategories = ['Milk Tea', 'Matcha Series', 'Special Items', 'Ice Blended'];
//   const category = item.category_name || '';
//   const name = item.item_name || '';
//   return milkCategories.includes(category) && !name.includes('Slush');
// };

// export default function MenuBoard() {
//   const [menuItems, setMenuItems] = useState<Record<string, any[]>>({});
//   const [ingredients, setIngredients] = useState<Record<string, any[]>>({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const navigate = useNavigate();

//   const handleLogout = () => {
//     document.documentElement.style.fontSize = '16px';
//     document.documentElement.style.filter = '';
//     localStorage.clear();
//     sessionStorage.clear();
//     navigate('/');
//   };

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         // Fetch menu items
//         const itemsRes = await fetch('/api/items');
//         if (!itemsRes.ok) throw new Error(`Failed to fetch items: ${itemsRes.status}`);
//         const itemsJson = await itemsRes.json();

//         // Group items by category
//         const groupedItems: Record<string, any[]> = {};
//         itemsJson.forEach((item: any) => {
//           const cat = item.category_name || 'Uncategorized';
//           if (cat === 'Uncategorized') return;
//           if (!groupedItems[cat]) groupedItems[cat] = [];
//           groupedItems[cat].push(item);
//         });

//         // Fetch ingredients
//         const ingRes = await fetch('/api/ingredients');
//         if (!ingRes.ok) throw new Error(`Failed to fetch ingredients: ${ingRes.status}`);
//         const ingJson = await ingRes.json();

//         // Group ingredients for visual customization bar
//         const groupedIngredients: Record<string, any[]> = {};
//         ingJson.forEach((ing: any) => {
//           const cat = ing.ingredient_category_name || 'Other';
//           if (
//             singleSelectCategories.map(c => c.toLowerCase()).includes(cat.toLowerCase()) ||
//             multiSelectCategories.map(c => c.toLowerCase()).includes(cat.toLowerCase())
//           ) {
//             if (!groupedIngredients[cat]) groupedIngredients[cat] = [];
//             groupedIngredients[cat].push(ing);
//           }
//         });

//         setMenuItems(groupedItems);
//         setIngredients(groupedIngredients);
//         setLoading(false);
//       } catch (err: any) {
//         console.error(err);
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, []);

//   if (loading) return <p>Loading menu...</p>;
//   if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

//   // Split items into 3 columns
//   const menuColumns: Record<string, any[]> = { col1: [], col2: [], col3: [] };
//   Object.entries(menuItems).forEach(([cat, items], index) => {
//     if (index % 3 === 0) menuColumns.col1.push({ cat, items });
//     else if (index % 3 === 1) menuColumns.col2.push({ cat, items });
//     else menuColumns.col3.push({ cat, items });
//   });

//   return (
//     <div className="menu-board-container" style={{ display: 'flex', gap: '2%' }}>
//       <div className="menu-header-image" style={{ flex: 1 }}>
//         <img src="menu_image(new).png" alt="Menu Visual" className="main-menu-img" />
//       </div>

//       <div className="menu-content" style={{ flex: 2, overflowY: 'auto' }}>
//         <h1 className="menu-title">Menu Board</h1>

//         {/* ICON LEGEND */}
//         <div className="icon-legend" style={{ display: 'flex', gap: '1em', marginBottom: '1%' }}>
//           <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '0.3em' }}>
//             <span className="dietary-icon milk">🥛</span>
//             <span>Contains Milk</span>
//           </div>
//           <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '0.3em' }}>
//             <span className="dietary-icon gluten">🌾</span>
//             <span>Contains Gluten</span>
//           </div>
//         </div>

//         {/* MENU COLUMNS */}
//         <div className="menu-sections" style={{ display: 'flex', gap: '1%' }}>
//           {[menuColumns.col1, menuColumns.col2, menuColumns.col3].map((col, idx) => (
//             <div key={idx} className={`menu-column col-${idx + 1}`} style={{ flex: 1 }}>
//               {col.map(({ cat, items }) => (
//                 <MenuSection key={cat} title={cat} items={items} />
//               ))}
//             </div>
//           ))}
//         </div>

//         {/* CUSTOMIZATION BAR (visual-only) */}
//         <div className="customization-bar">
//           {/* Single-select categories */}
//           {singleSelectCategories.map((cat) => {
//             const items = ingredients[cat] || [];
//             if (!items.length) return null;
//             return (
//               <div key={cat} className="customization-group">
//                 <span className="customization-label">{cat}</span>
//                 <div className="options-row">
//                   {items.map((ing: any) => (
//                     <span key={ing.ingredient_id} className="option-item">
//                       <span className="option-label">{ing.ingredient_name}</span>
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             );
//           })}

//           {/* Multi-select categories */}
//           {multiSelectCategories.map((cat) => {
//             const items = ingredients[cat] || [];
//             if (!items.length) return null;
//             return (
//               <div key={cat} className="customization-group">
//                 <span className="customization-label">{cat}</span>
//                 <div className="options-row">
//                   {items.map((ing: any) => (
//                     <span key={ing.ingredient_id} className="option-item">
//                       <span className="option-label">{ing.ingredient_name}</span>
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         <button className="logout" onClick={handleLogout}>
//           Back to Login
//         </button>
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

//           {/* Special Items Tag */}
//           {title === 'Special Items' && <span className="new-tag-inline">NEW</span>}

//           {/* Dietary Icons */}
//           <span className="dietary-icons">
//             {requiresMilk(item) && (
//               <span className="dietary-icon milk" title="Contains Milk">
//                 🥛
//               </span>
//             )}
//             {isGluten(item.item_name) && (
//               <span className="dietary-icon gluten" title="Contains Gluten">
//                 🌾
//               </span>
//             )}
//           </span>

//           {/* Visual-only customization info for each item */}
//           {item.customization?.temperature && (
//             <div className="menu-customization">Temperature: {item.customization.temperature}</div>
//           )}
//           {item.customization?.extras?.length > 0 && (
//             <div className="menu-customization">
//               Toppings: {item.customization.extras.map((e: any) => e.ingredient_name).join(', ')}
//             </div>
//           )}
//         </li>
//       ))}
//     </ul>
//   </div>
// );





import React, { useEffect, useState } from 'react';
import './MenuBoard.css';
import { useNavigate } from 'react-router-dom';

const singleSelectCategories = ['Milk', 'Ice Level', 'Sizes', 'Sweetness Level', 'Temperature'];
const multiSelectCategories = ['Toppings'];

// Gluten detection
const isGluten = (itemName: string) => {
  const keywords = ['Pearl', 'Pudding'];
  return keywords.some((kw) => itemName.includes(kw));
};

// Milk detection
const requiresMilk = (item: any) => {
  const milkCategories = ['Milk Tea', 'Matcha Series', 'Special Items', 'Ice Blended'];
  const category = item.category_name || '';
  const name = item.item_name || '';
  return milkCategories.includes(category) && !name.includes('Slush');
};

export default function MenuBoard() {
  const [menuItems, setMenuItems] = useState<Record<string, any[]>>({});
  const [ingredients, setIngredients] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleLogout = () => {
    document.documentElement.style.fontSize = '16px';
    document.documentElement.style.filter = '';
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch menu items
        const itemsRes = await fetch('/api/items');
        if (!itemsRes.ok) throw new Error(`Failed to fetch items: ${itemsRes.status}`);
        const itemsJson = await itemsRes.json();

        // Group items by category
        const groupedItems: Record<string, any[]> = {};
        itemsJson.forEach((item: any) => {
          const cat = item.category_name || 'Uncategorized';
          if (cat === 'Uncategorized') return;
          if (!groupedItems[cat]) groupedItems[cat] = [];
          groupedItems[cat].push(item);
        });

        // Fetch ingredients
        const ingRes = await fetch('/api/ingredients');
        if (!ingRes.ok) throw new Error(`Failed to fetch ingredients: ${ingRes.status}`);
        const ingJson = await ingRes.json();

        // Group ingredients by category (for customization bar)
        const groupedIngredients: Record<string, any[]> = {};
        ingJson.forEach((ing: any) => {
          const cat = ing.ingredient_category_name || 'Other';
          // Only include API ingredients for customization bar except Temperature
          if (
            cat.toLowerCase() !== 'temperature' &&
            (singleSelectCategories.map(c => c.toLowerCase()).includes(cat.toLowerCase()) ||
              multiSelectCategories.map(c => c.toLowerCase()).includes(cat.toLowerCase()))
          ) {
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
        <img src="menu_image(new).png" alt="Menu Visual" className="main-menu-img" />
      </div>

      <div className="menu-content" style={{ flex: 2, overflowY: 'auto' }}>
        <h1 className="menu-title">Menu Board</h1>

        {/* ICON LEGEND */}
        <div className="icon-legend" style={{ display: 'flex', gap: '1em', marginBottom: '1%' }}>
          <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '0.3em' }}>
            <span className="dietary-icon milk">🥛</span>
            <span>Contains Milk</span>
          </div>
          <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '0.3em' }}>
            <span className="dietary-icon gluten">🌾</span>
            <span>Contains Gluten</span>
          </div>
        </div>

        {/* MENU COLUMNS */}
        <div className="menu-sections" style={{ display: 'flex', gap: '1%' }}>
          {[menuColumns.col1, menuColumns.col2, menuColumns.col3].map((col, idx) => (
            <div key={idx} className={`menu-column col-${idx + 1}`} style={{ flex: 1 }}>
              {col.map(({ cat, items }) => (
                <MenuSection key={cat} title={cat} items={items} />
              ))}
            </div>
          ))}
        </div>

        {/* CUSTOMIZATION BAR (visual-only) */}
        <div className="customization-bar">
          {[...singleSelectCategories, ...multiSelectCategories].map((cat) => {
            // Temperature is static Hot/Iced
            let options: string[] = [];
            if (cat === 'Temperature') {
              options = ['Hot', 'Iced'];
            } else {
              options = ingredients[cat]?.map((i: any) => i.ingredient_name) || [];
            }

            return (
              <div key={cat} className="customization-group">
                <span className="customization-label">{cat}</span>
                <div className="options-row">
                  {options.map((name) => (
                    <span key={name} className="option-item">
                      <span className="option-label">{name}</span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <button className="logout" onClick={handleLogout}>
          Back to Login
        </button>
      </div>
    </div>
  );
}

const MenuSection: React.FC<{ title: string; items: any[] }> = ({ title, items }) => (
  <div className="menu-section">
    <h3 className="section-title">{title}</h3>
    <ul className="menu-list">
      {items.map((item) => (
        <li key={item.item_ID} className="menu-item">
          <span>{item.item_name}</span>

          {/* Special Items Tag */}
          {title === 'Special Items' && <span className="new-tag-inline">NEW</span>}

          {/* Dietary Icons */}
          <span className="dietary-icons">
            {requiresMilk(item) && (
              <span className="dietary-icon milk" title="Contains Milk">
                🥛
              </span>
            )}
            {isGluten(item.item_name) && (
              <span className="dietary-icon gluten" title="Contains Gluten">
                🌾
              </span>
            )}
          </span>

          {/* Visual-only per-item customization */}
          {item.customization?.temperature && (
            <div className="menu-customization">Temperature: {item.customization.temperature}</div>
          )}
          {item.customization?.extras?.length > 0 && (
            <div className="menu-customization">
              Toppings: {item.customization.extras.map((e: any) => e.ingredient_name).join(', ')}
            </div>
          )}
        </li>
      ))}
    </ul>
  </div>
);

