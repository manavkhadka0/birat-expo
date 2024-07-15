"use client";
import Sponsors from "@/components/sponsors";
import StallLegend from "@/components/stall-legend";
import { useRouter } from "next/navigation";
import React from "react";

const SponsorsPage = () => {
  const router = useRouter();

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

export default SponsorsPage;
