"use client";
import Sponsors from "@/components/sponsors";
import StallLegend from "@/components/stall-legend";
import { useRouter } from "next/navigation";
import React from "react";

const SponsorsPage = () => {
  const router = useRouter();
  const legendItemsHangers = [
    { color: "#26abe2", label: "Sponsors" },
    { color: "#fb2e01", label: "Not Available" },
  ];

  const onAvailableStallClick = (stallId: string) => {
    console.log("Available stall clicked:", stallId);
    router.push(`/book-stall/${stallId}`);
  };
  return (
    <main className="container py-20">
      <div className="py-6">
        <a href="/" className="text-black">
          Back to Home
        </a>
      </div>
      <h2 className="text-black text-2xl md:text-6xl font-bold ">
        Sponsors Pavilion
      </h2>
      <StallLegend legendItems={legendItemsHangers} />
      <div className="z-10 flex max-w-7xl mx-auto">
        <Sponsors
          bookedStalls={[""]}
          onAvailableStallClick={onAvailableStallClick}
        />
      </div>
    </main>
  );
};

export default SponsorsPage;
