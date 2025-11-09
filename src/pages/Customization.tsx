import React from "react";

export const Customization: React.FC = () => {
  return (
    <div className="p-4 w-[600px] h-[594px] relative bg-white text-gray-800 font-calibri">
      <h2 className="text-sm mb-2">Customize Drink</h2>

      <button className="absolute top-3 right-3 bg-red-500 text-white px-2 rounded">
        X
      </button>

      <hr className="my-2 border-gray-300" />

      <div>
        <label className="block mt-2 mb-1">Size</label>
        <div className="flex gap-2">
          <button className="btn">Cup (S)</button>
          <button className="btn">Cup (M)</button>
          <button className="btn">Cup (L)</button>
        </div>
      </div>

      <div className="mt-6">
        <label className="block mb-1">Milk</label>
        <div className="flex gap-2">
          <button className="btn">Milk</button>
          <button className="btn">Non-Dairy Milk</button>
        </div>
      </div>

      <div className="mt-6">
        <label className="block mb-1">Miscellaneous</label>
        <div className="flex gap-2 flex-wrap">
          <button className="btn">Bag</button>
          <button className="btn">Straw</button>
          <button className="btn">Napkin</button>
          <button className="btn">To-go Box</button>
          <button className="btn">Ice</button>
          <button className="btn">Lid</button>
        </div>
      </div>

      <p className="mt-4 text-sm">Customizations:</p>
      <button className="w-full mt-2 bg-blue-600 text-white py-2 rounded">
        Confirm
      </button>
    </div>
  );
};