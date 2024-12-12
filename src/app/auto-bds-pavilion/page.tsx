"use client";
import { useState, useCallback, useMemo } from "react";
import StallArea from "@/components/stall-area";
import AutoBDSPavilion from "@/components/auto-bds-pavilion";
import { useRouter } from "next/navigation";
import { useGetStallTypeData } from "@/api/stall-status";
import { StallTypeData } from "@/types/stall";

const legendItems = [
  { color: "#fccc65", label: "Auto Pavilion (A)" },
  { color: "#fb2e01", label: "Booked" },
  { color: "#fffa00", label: "Reserved" },
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

  const autoData = useGetStallTypeData("Automobiles");

  const isLoading = autoData.stallTypeDataLoading;
  const isError = autoData.stallTypeDataError;

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
      autoData.stallTypeData
        ? autoData.stallTypeData
        : { booked: [], pending: [], stall_no_booked: [], stall_no_pending: [] }
    );

    return {
      bookedStalls: autoProcessed.booked,
      reservedStalls: autoProcessed.reserved,
    };
  }, [isLoading, isError, autoData.stallTypeData]);

  const onAvailableStallClick = useCallback((stallId: string) => {
    setSelectedStalls((prevSelected) =>
      prevSelected.includes(stallId)
        ? prevSelected.filter((id) => id !== stallId)
        : [...prevSelected, stallId]
    );
  }, []);

  const handleProceed = () => {
    if (selectedStalls.length === 0) return;

    const hasAutoStalls = selectedStalls.some((stall) => stall.startsWith("A"));
    const hasBDSStalls = selectedStalls.some((stall) => stall.startsWith("E"));

    if (hasAutoStalls && hasBDSStalls) {
      alert("Please select stalls only from one pavilion");
      return;
    }

    const type = hasAutoStalls ? "Automobiles" : "BDS Providers Stall";
    router.push(
      `/book-stalls?stalls=${selectedStalls.join(
        ","
      )}&total=${totalPrice}&type=${type}`
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError) {
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

  return (
    <div className="relative">
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
      <StallArea
        title="Automobiles and Business Development Service Pavilion"
        legendItems={legendItems}
        StallComponent={AutoBDSPavilion}
        stallProps={{
          bookedStalls,
          reservedStalls,
          onAvailableStallClick,
          selectedStalls,
          stallPrice: 60000,
          totalPrice,
          setTotalPrice,
        }}
      />
    </div>
  );
};

export default AutoPage;
