"use client";

import { useState, useCallback } from "react";
import StallArea from "@/components/stall-area";
import { useRouter } from "next/navigation";
import Hanger3 from "@/components/hanger-3";

const Hanger3Page = () => {
  const router = useRouter();
  const [selectedStalls, setSelectedStalls] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

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
      let type = "National General";
      if (
        selectedStalls.filter((stall) => primeStallsType1.includes(stall))
          .length > 0 ||
        selectedStalls.filter((stall) => primeStallsType2.includes(stall))
          .length > 0
      ) {
        type = "National Prime";
      }
      router.push(
        `/book-stalls?stalls=${selectedStalls.join(
          ","
        )}&total=${totalPrice}&type=${type}`
      );
    }
  };

  const primeStallsType1 = ["B153", "B154", "B228", "B227"];

  const primeStallsType2 = [
    "B189",
    "B190",
    "B191",
    "B192",
    "B174",
    "B175",
    "B206",
    "B207",
  ];

  const notAvailableStalls = ["b3d4ab18d0"];

  const toiletStalls = ["B172", "B209"];

  const reservedStalls = [""];

  const bookedStalls = [
    { id: "B173", companyName: "Company X" },
    { id: "B208", companyName: "Company Y" },
  ];

  return (
    <div className="relative">
      <StallArea
        title="Hanger 3 : Agro and SME Stalls"
        subtitle="Agro and SME Stalls"
        legendItems={legendItemsHangers}
        StallComponent={Hanger3}
        stallProps={{
          bookedStalls,
          reservedStalls,
          primeStallsType1,
          primeStallsType2,
          toiletStalls,
          notAvailableStalls,
          onAvailableStallClick: onAvailableStallClick,
          selectedStalls: selectedStalls,
          totalPrice: totalPrice,
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

export default Hanger3Page;
