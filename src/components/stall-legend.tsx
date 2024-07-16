// StallLegend.tsx

import React from "react";

type LegendItem = {
  color: string;
  label: string;
};

type StallLegendProps = {
  legendItems: LegendItem[];
};

const StallLegend: React.FC<StallLegendProps> = ({ legendItems }) => {
  return (
    <div className="p-4 bg-gray-100 rounded-lg my-2 shadow-md">
      <h2 className="text-lg font-semibold mb-3">Color Legend</h2>
      <div className="space-x-2 flex flex-wrap">
        {legendItems.map((item, index) => (
          <LegendItem key={index} {...item} />
        ))}
      </div>
    </div>
  );
};

const LegendItem: React.FC<LegendItem> = ({ color, label }) => (
  <div className="flex items-center">
    <div
      className="w-6 h-6 rounded-sm mr-2 border border-gray-300"
      style={{ backgroundColor: color }}
    ></div>
    <span>{label}</span>
  </div>
);

export default StallLegend;
