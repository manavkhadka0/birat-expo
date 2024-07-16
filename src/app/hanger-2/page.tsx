"use client";
import Hanger2 from "@/components/hanger-2";
import StallLegend from "@/components/stall-legend";
import { useRouter } from "next/navigation";
import React from "react";

const Hanger2Page = () => {
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
    <main className=" py-20 container">
      <div className="py-6">
        <a href="/" className="text-black">
          Back to Home
        </a>
      </div>
      <h2 className="text-black text-2xl md:text-6xl font-bold ">
        Hanger 2- Industrial and Coporate Stalls
      </h2>
      <StallLegend legendItems={legendItemsHangers} />
      <div className="z-10  flex  w-[1200px] mt-10 mx-auto">
        <Hanger2
          bookedStalls={[""]}
          primeStallsType1={["B77", "B78", "B152", "B151"]}
          primeStallsType2={[
            "B113",
            "B114",
            "B115",
            "B116",
            "B98",
            "B99",
            "B130",
            "B131",
          ]}
          toiletStalls={["B133", "B96"]}
          reservedStalls={[""]}
          notAvailableStalls={["eb1d587ec6"]}
          onAvailableStallClick={onAvailableStallClick}
        />
      </div>
    </main>
  );
};

export default Hanger2Page;
