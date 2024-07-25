"use client";

import { useState, useCallback } from "react";
import StallArea from "@/components/stall-area";
import { useRouter } from "next/navigation";
import Sponsors from "@/components/sponsors";

type SponsorStallPropsType = {
  sponsor_type: string;
  price: number;
  color: string;
  stallid: string[];
};

type StallInfo = {
  id: string;
  companyName: string;
};

const SponsorsPage = () => {
  const router = useRouter();
  const [selectedStalls, setSelectedStalls] = useState<string[]>([]);

  const legendItemsSponsors = [
    { color: "#3498DB", label: "Main Sponsor" },
    { color: "#E67E22", label: "Powered By Sponsor" },
    { color: "#95A5A6", label: "Platinum" },
    { color: "#1ABC9C", label: "Diamond" },
    { color: "#F1C40F", label: "Gold" },
    { color: "#9B59B6", label: "Partner Sponsor" },
    { color: "#BDC3C7", label: "Silver" },
    { color: "#E74C3C", label: "Booked" },
    { color: "#ffff00", label: "Reserved" },
    { color: "#2ECC71", label: "Selected" },
  ];

  const sponsorStallProps: SponsorStallPropsType[] = [
    {
      sponsor_type: "Main Sponsor",
      price: 7500000,
      color: "#3498DB",
      stallid: ["S1"],
    },
    {
      sponsor_type: "Powered By Sponsor",
      price: 3500000,
      color: "#E67E22",
      stallid: ["S2"],
    },
    {
      sponsor_type: "Platinum",
      price: 200000,
      color: "#95A5A6",
      stallid: ["S3"],
    },
    {
      sponsor_type: "Diamond",
      price: 1500000,
      color: "#1ABC9C",
      stallid: ["S4"],
    },
    {
      sponsor_type: "Gold",
      price: 1000000,
      color: "#F1C40F",
      stallid: ["S5"],
    },
    {
      sponsor_type: "Partner Sponsor",
      price: 1000000,
      color: "#9B59B6",
      stallid: ["S6", "S7", "S8"],
    },
    {
      sponsor_type: "Silver",
      price: 500000,
      color: "#BDC3C7",
      stallid: ["S9", "S10", "S11", "S12"],
    },
  ];

  const bookedStalls: StallInfo[] = [
    // { id: "S1", companyName: "Company A" },
    // // Add more as needed
  ];

  const reservedStalls: StallInfo[] = [
    // { id: "S6", companyName: "Company B" },
    // // Add more as needed
  ];

  const onAvailableStallClick = useCallback((stallId: string) => {
    setSelectedStalls((prevSelected) => {
      if (prevSelected.includes(stallId)) {
        return prevSelected.filter((id) => id !== stallId);
      } else {
        if (prevSelected.length === 0) {
          return [stallId];
        } else {
          alert("You can only select one stall.");
          return prevSelected;
        }
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
        legendItems={legendItemsSponsors}
        StallComponent={Sponsors}
        stallProps={{
          sponsorStallProps: sponsorStallProps,
          bookedStalls: bookedStalls,
          reservedStalls: reservedStalls,
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
            Book Now
          </button>
        </div>
      )}
    </div>
  );
};

export default SponsorsPage;
