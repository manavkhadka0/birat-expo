"use client";
import AutoBDSPavilion from "@/components/auto-bds-pavilion";
import Food from "@/components/food";
import Hanger3 from "@/components/hanger-3";
import StallLegend from "@/components/stall-legend";
import Image from "next/image";
import React from "react";

const page = () => {
  const onAvailableStallClick = (stallId: string) => {
    console.log("Available stall clicked:", stallId);
  };
  return (
    <main className="container ">
      <div className="py-6">
        <a href="/" className="text-black">
          Back to Home
        </a>
      </div>
      <h2 className="text-black text-2xl md:text-6xl font-bold pt-20">
        Food Stalls
      </h2>
      <StallLegend />
      <div className="z-10  max-w-7xl mt-28 mx-auto">
        <Food
          bookedStalls={["F1"]}
          reservedStalls={["F10"]}
          notAvailableStalls={["F5"]}
          onAvailableStallClick={onAvailableStallClick}
        />
      </div>
    </main>
  );
};

export default page;
