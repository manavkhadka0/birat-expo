"use client";

import { useState, useCallback } from "react";
import Food from "@/components/food";
import StallArea from "@/components/stall-area";
import { useRouter } from "next/navigation";

type StallInfo = {
  id: string;
  companyName: string;
};

const FoodPage = () => {
  const router = useRouter();
  const [selectedStalls, setSelectedStalls] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const legendItemsFood = [
    { color: "#6fbe49", label: "Food Stalls" },
    { color: "#fb2e01", label: "Not Available" },
    { color: "#00ff00", label: "Selected" },
  ];

  const onAvailableStallClick = useCallback((stallId: string) => {
    setSelectedStalls((prevSelected) => {
      if (prevSelected.includes(stallId)) {
        return prevSelected.filter((id) => id !== stallId);
      } else {
        return [...prevSelected, stallId];
      }
    });
  }, []);

  const handleProceed = () => {
    if (selectedStalls.length > 0) {
      router.push(
        `/book-stalls?stalls=${selectedStalls.join(
          ","
        )}&type=Food stalls&total=${totalPrice}`
      );
    }
  };

  const bookedStalls: StallInfo[] = [
    { id: "F1", companyName: "Food Company X" },
    { id: "F2", companyName: "Food Provider Y" },
  ];

  return (
    <div className="relative">
      <StallArea
        title="Food Stalls"
        subtitle="Food and Beverage Stalls"
        legendItems={legendItemsFood}
        StallComponent={Food}
        stallProps={{
          bookedStalls: bookedStalls,
          onAvailableStallClick: onAvailableStallClick,
          selectedStalls: selectedStalls,
          totalPrice: totalPrice,
          stallPrice: 100000,
          setTotalPrice: setTotalPrice,
        }}
      />

      {selectedStalls.length > 0 && (
        <div className="fixed gap-4 bottom-8 left-1/2 transform -translate-x-1/2 flex justify-center z-50 bg-white px-10 py-10 rounded-md shadow-lg">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 text-lg rounded-full shadow-lg">
            Selected ({selectedStalls.join(",")})
          </button>

          <button
            onClick={handleProceed}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 text-lg rounded-full shadow-lg"
          >
            Proceed with Selected Stalls
          </button>
        </div>
      )}
    </div>
  );
};

export default FoodPage;
