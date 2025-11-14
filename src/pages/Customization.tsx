import React, { useState, useEffect } from "react";

type Selections = Record<string, string[]>;

export const Customization: React.FC<{
  initial?: Selections;
  onConfirm?: (selections: Selections) => void;
  onClose?: () => void;
}> = ({ initial = {}, onConfirm, onClose }) => {
  const customizationGroups = [
    { label: "Cup Sizes", options: ["Cup (S)", "Cup (M)", "Cup (L)"], multiple: false },
    { label: "Milk Options", options: ["Milk", "Non-Dairy Milk"], multiple: false },
    { label: "Drink Add-ons", options: ["Ice", "Lid", "Straw"], multiple: true },
    { label: "Packaging Options", options: ["Bag", "Napkin", "To-go Box"], multiple: true },
  ];

  const [selections, setSelections] = useState<Selections>(initial);

  // keep selections in sync if parent supplies new initial
  useEffect(() => setSelections(initial), [initial]);

  const handleSelect = (groupLabel: string, option: string, multiple: boolean) => {
    setSelections((prev) => {
      const groupSelections = prev[groupLabel] || [];
      if (groupSelections.includes(option)) {
        return { ...prev, [groupLabel]: groupSelections.filter((o) => o !== option) };
      } else {
        return { ...prev, [groupLabel]: multiple ? [...groupSelections, option] : [option] };
      }
    });
  };

  return (
    <div className="customization-modal p-4 w-[600px] h-[594px] relative bg-white text-gray-800 font-calibri shadow-lg">
      <h2 className="text-sm mb-2">Customize Drink</h2>

      <button
        className="absolute top-3 right-3 bg-red-500 text-white px-2 rounded"
        aria-label="Close"
        onClick={() => onClose && onClose()}
      >
        X
      </button>

      <hr className="my-2 border-gray-300" />

      <div className="overflow-y-auto max-h-[420px]">
        {customizationGroups.map((group) => (
          <div key={group.label} className="mt-4">
            <label className="block mb-2 font-semibold">{group.label}</label>
            <div className="flex flex-wrap gap-2">
              {group.options.map((option) => {
                const isSelected = selections[group.label]?.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => handleSelect(group.label, option, group.multiple)}
                    className={`px-3 py-2 border rounded ${
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
      </div>

      <p className="mt-4 text-sm">Customizations: {JSON.stringify(selections)}</p>

      <button
        className="w-full mt-2 bg-blue-600 text-white py-2 rounded"
        onClick={() => onConfirm && onConfirm(selections)}
      >
        Confirm
      </button>
    </div>
  );
};