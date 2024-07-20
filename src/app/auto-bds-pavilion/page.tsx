"use client";
import { useState, useCallback } from "react";
import StallArea from "@/components/stall-area";
import AutoBDSPavilion from "@/components/auto-bds-pavilion";
import { useRouter } from "next/navigation";
import StallsList from "@/components/stalls-list";

const legendItems = [
  { color: "#fccc65", label: "Auto Pavilion (A)" },
  { color: "#ffff", label: "BDS Pavilion(E)" },
  { color: "#fb2e01", label: "Not Available" },
  { color: "#00ff00", label: "Selected" },
];

type StallInfo = {
  id: string;
  companyName: string;
};

const AutoPage = () => {
  const router = useRouter();
  const [selectedStalls, setSelectedStalls] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  const onAvailableStallClick = useCallback((stallId: string) => {
    setSelectedStalls((prevSelected) => {
      if (prevSelected.includes(stallId)) {
        return prevSelected.filter((id) => id !== stallId);
      } else {
        return [...prevSelected, stallId];
      }
    });
  }, []);

  const bookedStalls: StallInfo[] = [
    { id: "A1", companyName: "Auto Company X" },
    { id: "E2", companyName: "BDS Provider Y" },
  ];

  const reservedStalls: StallInfo[] = [
    { id: "A3", companyName: "Reserved for Auto Z" },
    { id: "E4", companyName: "Reserved for BDS W" },
  ];

  const handleProceed = () => {
    if (selectedStalls.length > 0) {
      // selected stalls start with A are from Auto Pavilion
      // selected stalls start with E are from BDS Pavilion
      // if both are selected alert user to select only one type of stalls
      if (
        selectedStalls.some((stall) => stall.startsWith("A")) &&
        selectedStalls.some((stall) => stall.startsWith("E"))
      ) {
        alert("Please select stalls only from one pavilion");
        return;
      }
      const type = selectedStalls[0].startsWith("A")
        ? "Automobiles"
        : "BDS Providers Stall";

      router.push(
        `/book-stalls?stalls=${selectedStalls.join(
          ","
        )}&total=${totalPrice}&type=${type}`
      );
    }
  };

  return (
    <div className="relative">
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
      <StallArea
        title="Automobiles and Business Development Service Pavilion"
        subtitle="Auto and BDS Stalls"
        legendItems={legendItems}
        StallComponent={AutoBDSPavilion}
        stallProps={{
          bookedStalls: bookedStalls,
          reservedStalls: reservedStalls,
          onAvailableStallClick: onAvailableStallClick,
          selectedStalls: selectedStalls,
          stallPrice: 60000,
          totalPrice: totalPrice,
          setTotalPrice: setTotalPrice,
        }}
      />
    </div>
  );
};

export default AutoPage;
