"use client";

import { useState, useCallback } from "react";
import StallArea from "@/components/stall-area";
import { useRouter } from "next/navigation";
import Hanger3 from "@/components/hanger-3";

const Hanger3Page = () => {
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
        title="Hanger 3"
        subtitle="Agro and SME Stalls"
        legendItems={legendItemsHangers}
        StallComponent={Hanger3}
        stallProps={{
          bookedStalls: [""],
          reservedStalls: [""],
          primeStallsType1: ["B153", "B154", "B228", "B227"],
          primeStallsType2: [
            "B189",
            "B190",
            "B191",
            "B192",
            "B174",
            "B175",
            "B206",
            "B207",
          ],
          toiletStalls: ["B172", "B209"],
          notAvailableStalls: ["b3d4ab18d0"],
          onAvailableStallClick: onAvailableStallClick,
          selectedStalls: selectedStalls,
        }}
      />

      {selectedStalls.length > 0 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex justify-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 text-lg rounded-full shadow-lg"
          >
            View Selected ({selectedStalls.length})
          </button>
        </div>
      )}

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Selected Stalls
              </h3>
              <div className="mt-2 px-7 py-3">
                <ul className="text-sm text-gray-500">
                  {selectedStalls.map((stall) => (
                    <li key={stall} className="mb-1">
                      {stall}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={handleProceed}
                  className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
                >
                  Proceed with Selected Stalls
                </button>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hanger3Page;
