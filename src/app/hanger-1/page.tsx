"use client";
import AutoBDSPavilion from "@/components/auto-bds-pavilion";
import Hanger1 from "@/components/hanger-1";
import Hanger2 from "@/components/hanger-2";
import Hanger3 from "@/components/hanger-3";
import Image from "next/image";
import React from "react";

const page = () => {
  const onAvailableStallClick = (stallId: string) => {
    console.log("Available stall clicked:", stallId);
  };
  return (
    <main className="h-screen bg-gray-100 py-20">
      <h2 className="text-black text-2xl md:text-6xl font-bold text-center">
        Hanger 1- Industrial and Coporate Stalls
      </h2>
      <ul className="text-center mt-6">
        <li>
          Free stalls are in
          <span className="text-green-500"> green </span> color
        </li>

        <li>
          Booked stalls are in
          <span className="text-red-500"> red </span> color
        </li>
        <li>
          Reserved stalls are in
          <span className="text-yellow-500"> yellow </span> color
        </li>
      </ul>
      <div className="z-10  flex max-w-7xl mx-auto">
        <Hanger1
          bookedStalls={["B61"]}
          reservedStalls={["B76"]}
          notAvailableStalls={["03c0fa4260"]}
          onAvailableStallClick={onAvailableStallClick}
        />
      </div>
    </main>
  );
};

export default page;
