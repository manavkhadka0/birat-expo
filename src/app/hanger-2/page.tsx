"use client";

import { useState, useCallback } from "react";
import StallArea from "@/components/stall-area";
import { useRouter } from "next/navigation";
import Hanger2 from "@/components/hanger-2";

const Hanger2Page = () => {
  const router = useRouter();
  const [selectedStalls, setSelectedStalls] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        title="Hanger 2 : Industrial and Corporate Stalls"
        subtitle="Industrial and Corporate Stalls"
        legendItems={legendItemsHangers}
        StallComponent={Hanger2}
        stallProps={{
          primeStallsType1: ["B77", "B78", "B152", "B151"],
          primeStallsType2: [
            "B113",
            "B114",
            "B115",
            "B116",
            "B98",
            "B99",
            "B130",
            "B131",
          ],
          toiletStalls: ["B133", "B96"],
          reservedStalls: [""],
          bookedStalls: [""],
          notAvailableStalls: ["eb1d587ec6"],
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

export default Hanger2Page;
