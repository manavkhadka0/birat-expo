"use client";
import Hanger2 from "@/components/hanger-2";
import StallLegend from "@/components/stall-legend";
import { useRouter } from "next/router";
import React from "react";

const Hanger2Page = () => {
  const router = useRouter();

  const onAvailableStallClick = (stallId: string) => {
    console.log("Available stall clicked:", stallId);
    router.push(`/book-stall/${stallId}`);
  };
  return (
    <main className=" py-20 container">
      <div className="py-6">
        <a href="/" className="text-black">
          Back to Home
        </a>
      </div>
      <h2 className="text-black text-2xl md:text-6xl font-bold ">
        Hanger 2- Industrial and Coporate Stalls
      </h2>
      <StallLegend />
      <div className="z-10  flex  w-[1200px] mt-10 mx-auto">
        <Hanger2
          bookedStalls={["B152"]}
          primeStalls={[""]}
          reservedStalls={["B145"]}
          notAvailableStalls={["eb1d587ec6"]}
          onAvailableStallClick={onAvailableStallClick}
        />
      </div>
    </main>
  );
};

export default Hanger2Page;
