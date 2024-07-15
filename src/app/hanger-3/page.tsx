"use client";
import AutoBDSPavilion from "@/components/auto-bds-pavilion";
import Hanger3 from "@/components/hanger-3";
import StallLegend from "@/components/stall-legend";
import Image from "next/image";
import React from "react";

const page = () => {
  const onAvailableStallClick = (stallId: string) => {
    console.log("Available stall clicked:", stallId);
  };
  return (
    <main className=" py-20 container">
      <div className="py-6">
        <a href="/" className="text-black">
          Back to Home
        </a>
      </div>
      <h2 className="text-black text-2xl md:text-6xl font-bold ">
        Hanger 3- Agro and SME Stalls
      </h2>
      <StallLegend />
      <div className="z-10  flex mt-6 mx-auto">
        <Hanger3
          bookedStalls={["B153", "E40", "A9"]}
          reservedStalls={["A2"]}
          primeStalls={["B154"]}
          notAvailableStalls={["b3d4ab18d0"]}
          onAvailableStallClick={onAvailableStallClick}
        />
      </div>
    </main>
  );
};

export default page;
