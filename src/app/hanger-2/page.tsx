"use client";

import { useState, useCallback } from "react";
import StallArea from "@/components/stall-area";
import { useRouter } from "next/navigation";
import Hanger2 from "@/components/hanger-2";
import { set } from "react-hook-form";

const Hanger2Page = () => {
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

  const reservedStalls = ["B77"];

  const primeStallsType1 = [
    "B113",
    "B114",
    "B115",
    "B116",
    "B98",
    "B99",
    "B130",
    "B131",
  ];

  const toiletStalls = ["B133", "B96"];

  const primeStallsType2 = ["B77", "B78", "B152", "B151"];

  const bookedStalls = [
    { id: "B112", companyName: "Company x" },
    { id: "B117", companyName: "Company y" },
  ];

  return (
    <div className="relative">
      <StallArea
        title="Hanger 2 : Industrial and Corporate Stalls"
        subtitle="Industrial and Corporate Stalls"
        legendItems={legendItemsHangers}
        StallComponent={Hanger2}
        stallProps={{
          primeStallsType1,
          primeStallsType2,
          toiletStalls,
          reservedStalls,
          bookedStalls,
          notAvailableStalls: ["eb1d587ec6"],
          selectedStalls: selectedStalls,
          onAvailableStallClick: onAvailableStallClick,
          totalPrice: totalPrice,
          setTotalPrice,
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
