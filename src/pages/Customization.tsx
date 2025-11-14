import React, { useState } from "react";
import CashierNavbar from "../components/CashierNavbar";

export const Customization: React.FC = () => {
  const customizationGroups = [
    {
      label: "Cup Sizes",
      options: ["Cup (S)", "Cup (M)", "Cup (L)"],
      multiple: false,
    },
    {
      label: "Milk Options",
      options: ["Milk", "Non-Dairy Milk"],
      multiple: false,
    },
    {
      label: "Drink Add-ons",
      options: ["Ice", "Lid", "Straw"],
      multiple: true,
    },
    {
      label: "Packaging Options",
      options: ["Bag", "Napkin", "To-go Box"],
      multiple: true,
    },
  ];

  const [selections, setSelections] = useState<Record<string, string[]>>({});

  const handleSelect = (groupLabel: string, option: string, multiple: boolean) => {
    setSelections((prev) => {
      const groupSelections = prev[groupLabel] || [];
      if (groupSelections.includes(option)) {
        return { ...prev, [groupLabel]: groupSelections.filter((o) => o !== option) };
      } else {
        return {
          ...prev,
          [groupLabel]: multiple ? [...groupSelections, option] : [option],
        };
      }
    });
  };

  return (
    <div className="orders-layout">
      {/* left sidebar */}
      <div className="sidebar sidebar-left">
        <h2 className="section-title">Customization</h2>
        <p className="muted text-sm">
          Choose cup size, milk type, and any add-ons or packaging options.
        </p>
      </div>

      {/* main content */}
      <div className="content">
        <CashierNavbar />
        <h2 className="section-title">Customize Drink</h2>
        <hr className="my-2 border-gray-300" />

        {customizationGroups.map((group) => (
          <div key={group.label} className="customization-group mt-6">
            <h3 className="customization-label">{group.label}</h3>

            <div
              className={
                group.multiple
                  ? "grid grid-cols-3 gap-3 mt-2"
                  : "flex gap-2 flex-wrap mt-2"
              }
            >
              {group.options.map((option) => {
                const isSelected = selections[group.label]?.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() =>
                      handleSelect(group.label, option, group.multiple)
                    }
                    className={`item-card w-auto px-4 py-2 border rounded transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Selections summary */}
        <div className="customization-footer mt-8">
          <p className="text-sm muted">
            Selected Options:{" "}
            {Object.keys(selections).length === 0 ? "None" : ""}
          </p>
          {Object.entries(selections).map(([group, opts]) => (
            <p key={group} className="text-sm">
              <strong>{group}:</strong> {opts.join(", ")}
            </p>
          ))}

          <button className="btn btn-checkout mt-4 w-full">Confirm</button>
        </div>
      </div>

      {/* right sidebar */}
      <div className="sidebar sidebar-right">
        <div className="order-top">
          <h2 className="order-title">Preview</h2>
        </div>

        <div className="order-lines">
          {Object.keys(selections).length === 0 ? (
            <p className="empty muted">No customizations selected</p>
          ) : (
            Object.entries(selections).map(([group, opts]) => (
              <div key={group} className="order-line">
                <div>
                  <div className="order-line-title">{group}</div>
                  <div className="order-line-sub">{opts.join(", ")}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};