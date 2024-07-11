"use client";
import AutoBDSPavilion from "@/components/auto-bds-pavilion";
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
        Hanger 3- Agro and SME Stalls
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
      <div className="z-10  flex mt-6 mx-auto">
        <Hanger3
          bookedStalls={["B153", "E40", "A9"]}
          reservedStalls={["A2"]}
          notAvailableStalls={["b3d4ab18d0"]}
          onAvailableStallClick={onAvailableStallClick}
        />
      </div>
    </main>
  );
};

export default page;
