"use client";

import { useState, useCallback, useMemo } from "react";
import Hanger1 from "@/components/hanger-1";
import StallArea from "@/components/stall-area";
import { useRouter } from "next/navigation";
import { useGetStallTypeData } from "@/api/stall-status";
import { StallTypeData } from "@/types/stall";
import BDSPavilion from "@/components/bds-pavilion";

type StallInfo = {
  id: string;
  companyName: string;
};

const Hanger1Page = () => {
  const router = useRouter();
  const [selectedStalls, setSelectedStalls] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const bdsData = useGetStallTypeData("BDS Providers Stall");

  const isLoading = bdsData.stallTypeDataLoading;
  const isError = bdsData.stallTypeDataError;

  const { bookedStalls, reservedStalls } = useMemo(() => {
    if (isLoading || isError) return { bookedStalls: [], reservedStalls: [] };

    const processData = (
      data: StallTypeData
    ): { booked: StallInfo[]; reserved: StallInfo[] } => {
      const booked = data.stall_no_booked.map((stall) => ({
        id: stall[0],
        companyName: stall[1],
      }));
      const reserved = data.stall_no_pending.map((stall) => ({
        id: stall[0],
        companyName: stall[1],
      }));
      return { booked, reserved };
    };

    const bdsProcessed = processData(
      bdsData.stallTypeData
        ? bdsData.stallTypeData
        : { booked: [], pending: [], stall_no_booked: [], stall_no_pending: [] }
    );

    return {
      bookedStalls: bdsProcessed.booked,
      reservedStalls: bdsProcessed.reserved,
    };
  }, [isLoading, isError, bdsData.stallTypeData]);

  const legendItemsHangers = [
    { color: "#f5aeae", label: "Prime" },
    { color: "#f3efa3", label: "Prime" },
    { color: "#fffa00", label: "Reserved" },
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

  const primeStallsType1 = ["E1", "E2", "E35", "E36"];

  const primeStallsType2 = [
    "E10",
    "E27",
    "E17",
    "E18",
    "E19",
    "E20",
    "E12",
    "E13",
    "E24",
    "E25",
  ];

  const notAvailableStalls = ["ca2ada087c"];

  const toiletStalls = [""];

  const handleProceed = () => {
    if (selectedStalls.length > 0) {
      let type = "BDS Providers Stall";
      if (
        selectedStalls.filter((stall) => primeStallsType1.includes(stall))
          .length > 0 ||
        selectedStalls.filter((stall) => primeStallsType2.includes(stall))
          .length > 0
      ) {
        type = "BDS Providers Stall";
      }
      router.push(
        `/book-stalls?stalls=${selectedStalls.join(
          ","
        )}&total=${totalPrice}&type=${type}`
      );
    }
  };

  return (
    <div className="relative">
      <StallArea
        title="BDS Pavilion"
        legendItems={legendItemsHangers}
        StallComponent={BDSPavilion}
        stallProps={{
          bookedStalls,
          reservedStalls,
          toiletStalls: toiletStalls,
          primeStallsType1,
          primeStallsType2,
          notAvailableStalls,
          selectedStalls: selectedStalls,
          onAvailableStallClick: onAvailableStallClick,
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
            Book Now
          </button>
        </div>
      )}
    </div>
  );
};

export default Hanger1Page;
