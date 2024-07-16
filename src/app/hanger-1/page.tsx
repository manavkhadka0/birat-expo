"use client";
import AutoBDSPavilion from "@/components/auto-bds-pavilion";
import Hanger1 from "@/components/hanger-1";
import Hanger2 from "@/components/hanger-2";
import Hanger3 from "@/components/hanger-3";
import StallLegend from "@/components/stall-legend";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const Hanger1Page = () => {
  const router = useRouter();
  const legendItemsHangers = [
    { color: "#26abe2", label: "Toilet" },
    { color: "#f5aeae", label: "Prime" },
    { color: "#f3efa3", label: "Prime" },
    { color: "#fb2e01", label: "Not Available" },
  ];

  const onAvailableStallClick = (stallId: string) => {
    console.log("Available stall clicked:", stallId);
    router.push(`/book-stall/${stallId}`);
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
      <StallLegend legendItems={legendItemsHangers} />
      <div className="z-10  flex max-w-7xl mx-auto">
        <Hanger1
          bookedStalls={[""]}
          toiletStalls={["B20", "B57"]}
          primeStallsType1={["B1", "B2", "B76", "B75"]}
          primeStallsType2={[
            "B37",
            "B38",
            "B39",
            "B40",
            "B22",
            "B23",
            "B54",
            "B55",
          ]}
          reservedStalls={[""]}
          notAvailableStalls={["03c0fa4260"]}
          onAvailableStallClick={onAvailableStallClick}
        />
      </div>
    </main>
  );
};

export default Hanger1Page;
