import React from "react";

const StallLegend: React.FC = () => {
  const legendItems = [
    { color: "bg-[#6ec007]", label: "Available" },
    { color: "bg-[#FFB6C1]", label: "Prime" },
    { color: "bg-[#ffcc00]", label: "Reserved" },
    { color: "bg-[#fb2e01]", label: "Booked" },
    { color: "bg-white border border-gray-300", label: "Not Available" },
  ];

  return (
    <div className="p-4 bg-gray-100 rounded-lg my-2 shadow-md">
      <h2 className="text-lg font-semibold mb-3">Color Legend</h2>
      <div className="space-x-2 flex flex-wrap">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-6 h-6 ${item.color} rounded-sm mr-2`}></div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StallLegend;
