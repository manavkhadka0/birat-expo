"use client";

import { useState, useCallback } from "react";
import Food from "@/components/food";
import StallArea from "@/components/stall-area";
import { useRouter } from "next/navigation";
import Sponsors from "@/components/sponsors";

const SponsorsPage = () => {
  const router = useRouter();
  const [selectedStalls, setSelectedStalls] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const legendItemsFood = [
    { color: "#6fbe49", label: "Food Stalls" },
    { color: "#fb2e01", label: "Booked" },
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
      router.push(`/book-stalls?stalls=${selectedStalls.join(",")}`);
    }
  };

  return (
    <div className="relative">
      <StallArea
        title="Sponsors Pavilion"
        subtitle="Sponsor Stalls"
        legendItems={legendItemsFood}
        StallComponent={Sponsors}
        stallProps={{
          bookedStalls: [""],
          onAvailableStallClick: onAvailableStallClick,
          selectedStalls: selectedStalls,
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

export default SponsorsPage;
