import React, { useState } from "react";


export const Customization: React.FC = () => {
  const customizationGroups = [
    {
      label: "Cup Sizes",
      options: ["Cup (S)", "Cup (M)", "Cup (L)"],
     multiple: false

    },
    {
      label: "Milk Options",
      options: ["Milk", "Non-Dairy Milk"],
      multiple: false
    },
    {
      label: "Add-ons",
      options: ["Bag", "Straw", "Napkin", "To-go Box", "Ice", "Lid"],
      multiple: true
    },
  ];

const [selections, setSelections] = useState<Record<string, string[]>>({});

  const handleSelect = (groupLabel: string, option: string, multiple: boolean) => {
    setSelections((prev) => {
      const groupSelections = prev[groupLabel] || [];
      if (groupSelections.includes(option)) {
        // deselect
        return { ...prev, [groupLabel]: groupSelections.filter((o) => o !== option) };
      } else {
        // select
        return { ...prev, [groupLabel]: multiple ? [...groupSelections, option] : [option] };
      }
    });
  };

  return (
    <div className="p-4 w-[600px] h-[594px] relative bg-white text-gray-800 font-calibri">
      <h2 className="text-sm mb-2">Customize Drink</h2>

      <button className="absolute top-3 right-3 bg-red-500 text-white px-2 rounded" aria-label="Close">
        X
      </button>

      <hr className="my-2 border-gray-300" />

      {customizationGroups.map((group) => (
        <div className="mt-6" key={group.label}>
          <label className="block mb-1">{group.label}</label>
          <div className="flex gap-2 flex-wrap">
            {group.options.map((option) => {
              const isSelected = selections[group.label]?.includes(option);
              return (
                <button
                  key={option}
                  onClick={() => handleSelect(group.label, option, group.multiple)}
                  className={`px-3 py-1 border rounded ${
                    isSelected ? "bg-blue-500 text-white" : "hover:bg-gray-100"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <p className="mt-4 text-sm">Selected: {JSON.stringify(selections)}</p>

      <button className="w-full mt-2 bg-blue-600 text-white py-2 rounded">Confirm</button>
    </div>
  );
};