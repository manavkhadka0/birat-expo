"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import Food from "@/components/food";
import StallArea from "@/components/stall-area";
import { useRouter } from "next/navigation";
import { useGetStallTypeData } from "@/api/stall-status";
import { StallTypeData } from "@/types/stall";

type StallInfo = {
  id: string;
  companyName: string;
};

const FoodPage = () => {
  const router = useRouter();
  const [selectedStalls, setSelectedStalls] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const {
    stallTypeData,
    stallTypeDataEmpty,
    stallTypeDataError,
    stallTypeDataLoading,
  } = useGetStallTypeData("Food Stalls");

  const legendItemsFood = [
    { color: "#6fbe49", label: "Food Stalls" },
    { color: "#fffa00", label: "Reserved" },
    { color: "#fb2e01", label: "Booked" },
    { color: "#00ff00", label: "Selected" },
  ];

  const isLoading = stallTypeDataLoading;
  const isError = stallTypeDataError;

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

    const autoProcessed = processData(
      stallTypeData
        ? stallTypeData
        : { booked: [], pending: [], stall_no_booked: [], stall_no_pending: [] }
    );

    return {
      bookedStalls: [...autoProcessed.booked],
      reservedStalls: [...autoProcessed.reserved],
    };
  }, [isLoading, isError, stallTypeData]);

  const onAvailableStallClick = useCallback((stallId: string) => {
    setSelectedStalls((prevSelected) =>
      prevSelected.includes(stallId)
        ? prevSelected.filter((id) => id !== stallId)
        : [...prevSelected, stallId]
    );
  }, []);

  const handleProceed = () => {
    if (selectedStalls.length > 0) {
      router.push(
        `/book-stalls?stalls=${selectedStalls.join(
          ","
        )}&type=Food Stalls&total=${totalPrice}`
      );
    }
  };

  if (stallTypeDataLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (stallTypeDataError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline">
            {" "}
            Failed to load stall data. Please try again later.
          </span>
        </div>
      </div>
    );
  }

  // if (stallTypeDataEmpty) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <div
  //         className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative"
  //         role="alert"
  //       >
  //         <strong className="font-bold">Notice:</strong>
  //         <span className="block sm:inline">
  //           {" "}
  //           No stall data available at the moment.
  //         </span>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="relative">
      <StallArea
        title="Food Stalls"
        legendItems={legendItemsFood}
        StallComponent={Food}
        stallProps={{
          bookedStalls,
          reservedStalls,
          onAvailableStallClick,
          selectedStalls,
          totalPrice,
          stallPrice: 100000,
          setTotalPrice,
        }}
      />

      {selectedStalls.length > 0 && (
        <div className="fixed gap-4 bottom-8 left-1/2 transform -translate-x-1/2 flex justify-center z-50 bg-white px-10 py-10 rounded-md shadow-lg">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 text-lg rounded-full shadow-lg transition duration-300">
            Selected ({selectedStalls.join(",")})
          </button>

          <button
            onClick={handleProceed}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 text-lg rounded-full shadow-lg transition duration-300"
          >
            Book Now
          </button>
        </div>
      )}
    </div>
  );
};

export default FoodPage;
