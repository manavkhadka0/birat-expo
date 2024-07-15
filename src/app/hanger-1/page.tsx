"use client";
import AutoBDSPavilion from "@/components/auto-bds-pavilion";
import Hanger1 from "@/components/hanger-1";
import Hanger2 from "@/components/hanger-2";
import Hanger3 from "@/components/hanger-3";
import StallLegend from "@/components/stall-legend";
import Image from "next/image";
import React from "react";

const page = () => {
  const onAvailableStallClick = (stallId: string) => {
    console.log("Available stall clicked:", stallId);
  };
  return (
    <main className="py-20 container">
      <div className="py-6">
        <a href="/" className="text-black">
          Back to Home
        </a>
      </div>
      <h2 className="text-black text-2xl md:text-6xl font-bold ">
        Hanger 1- Industrial and Coporate Stalls
      </h2>
      <StallLegend />
      <div className="z-10  flex max-w-7xl mx-auto">
        <Hanger1
          bookedStalls={["B61"]}
          primeStalls={[""]}
          reservedStalls={["B76"]}
          notAvailableStalls={["03c0fa4260"]}
          onAvailableStallClick={onAvailableStallClick}
        />
      </div>
    </main>
  );
};

export default page;
