"use client";
import AutoBDSPavilion from "@/components/auto-bds-pavilion";
import Hanger3 from "@/components/hanger-3";
import StallLegend from "@/components/stall-legend";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const Hanger3Page = () => {
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
        Hanger 3- Agro and SME Stalls
      </h2>
      <StallLegend legendItems={legendItemsHangers} />
      <div className="z-10  flex mt-6 mx-auto">
        <Hanger3
          bookedStalls={[""]}
          reservedStalls={[""]}
          primeStallsType1={["B153", "B154", "B228", "B227"]}
          primeStallsType2={[
            "B189",
            "B190",
            "B191",
            "B192",
            "B174",
            "B175",
            "B206",
            "B207",
          ]}
          toiletStalls={["B172", "B209"]}
          notAvailableStalls={["b3d4ab18d0"]}
          onAvailableStallClick={onAvailableStallClick}
        />
      </div>
    </main>
  );
};

export default Hanger3Page;
