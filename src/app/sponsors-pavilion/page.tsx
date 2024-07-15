"use client";
import Sponsors from "@/components/sponsors";
import StallLegend from "@/components/stall-legend";
import React from "react";

const page = () => {
  const onAvailableStallClick = (stallId: string) => {
    console.log("Available stall clicked:", stallId);
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
      <StallLegend />
      <div className="z-10 flex max-w-7xl mx-auto">
        <Sponsors
          bookedStalls={["S1"]}
          reservedStalls={["S12"]}
          notAvailableStalls={[""]}
          onAvailableStallClick={onAvailableStallClick}
        />
      </div>
    </main>
  );
};

export default page;
