"use client";
import StallsList from "@/components/stalls-list";
import Image from "next/image";

export default function Proposal() {
  return (
    <div className="pt-20 pb-40 flex justify-center">
      <div className="flex justify-center flex-col items-center">
        <h2 className="text-4xl sm:text-5xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 uppercase mb-10">
          Birat Expo 2025 Floor Plan
        </h2>
        <Image
          src="/floor-plan.jpg"
          alt="biratexpo floor plan"
          className="max-w-100 border  rounded-r-md"
          width={1000}
          height={100}
        />
        <h2 className="text-4xl sm:text-5xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 uppercase my-10">
          Book your stalls now
        </h2>
        <StallsList></StallsList>
      </div>
    </div>
  );
}
