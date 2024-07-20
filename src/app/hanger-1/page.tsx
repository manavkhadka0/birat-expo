"use client";

import { useState, useCallback } from "react";
import Hanger1 from "@/components/hanger-1";
import StallArea from "@/components/stall-area";
import { useRouter } from "next/navigation";

const Hanger1Page = () => {
  const router = useRouter();
  const [selectedStalls, setSelectedStalls] = useState<string[]>([]);

  const legendItemsHangers = [
    { color: "#26abe2", label: "Toilet" },
    { color: "#f5aeae", label: "Prime" },
    { color: "#f3efa3", label: "Prime" },
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
      router.push(`/book-stalls?stalls=${selectedStalls.join(",")}`);
    }
  };

  return (
    <div className="relative">
      <StallArea
        title="Hanger 1 : Industrial and Corporate Stalls"
        subtitle="Industrial and Corporate Stalls"
        legendItems={legendItemsHangers}
        StallComponent={Hanger1}
        stallProps={{
          bookedStalls: [""],
          toiletStalls: ["B20", "B57"],
          primeStallsType1: ["B1", "B2", "B76", "B75"],
          primeStallsType2: [
            "B37",
            "B38",
            "B39",
            "B40",
            "B22",
            "B23",
            "B54",
            "B55",
          ],
          reservedStalls: [""],
          notAvailableStalls: ["03c0fa4260"],
          selectedStalls: selectedStalls,
          onAvailableStallClick: onAvailableStallClick,
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

export default Hanger1Page;
