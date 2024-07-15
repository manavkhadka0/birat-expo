"use client";
import AutoBDSPavilion from "@/components/auto-bds-pavilion";
import StallLegend from "@/components/stall-legend";
import Image from "next/image";
import React from "react";

const page = () => {
  const onAvailableStallClick = (stallId: string) => {
    console.log("Available stall clicked:", stallId);
  };
  return (
    <main className="container  py-20">
      <div className="py-6">
        <a href="/" className="text-black">
          Back to Home
        </a>
      </div>
      <h2 className="text-black text-2xl md:text-6xl font-bold ">
        Auto and Business Development Service Pavilion
      </h2>
      <StallLegend />
      <div className="z-10 max-w-5xl flex h-[800px] w-[1200px] mx-auto">
        <AutoBDSPavilion
          bookedStalls={["A1", "E40", "A9"]}
          reservedStalls={["A2"]}
          onAvailableStallClick={onAvailableStallClick}
        />
      </div>
    </main>
  );
};

export default page;
