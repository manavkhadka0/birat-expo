import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { Vortex } from "@/components/ui/vortex";
import Image from "next/image";
import React from "react";

export default function Home() {
  return (
    <>
      <div className=" mx-auto  h-screen overflow-hidden">
        <Vortex
          backgroundColor="black"
          rangeY={800}
          particleCount={500}
          baseHue={120}
          className="flex items-center gap-4 flex-col justify-center px-2 md:px-10  py-4 w-full h-full"
        >
          <Image
            src="/logo.png"
            alt="Birat Expo 2024"
            width={600}
            height={600}
          />
          <h2 className="text-white text-2xl md:text-6xl font-bold text-center">
            Welcome to Birat Expo 2024 Stall booking portal
          </h2>
          <p className="text-white text-sm md:text-2xl max-w-xl mt-6 text-center">
            Click the buttons below to view our stall layout and book a stall
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
            <a
              href="/floor-plan.pdf"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition duration-200 rounded-lg text-white shadow-[0px_2px_0px_0px_#FFFFFF40_inset]"
            >
              View Floor Plan
            </a>
            <a href="/all-stalls" className="px-4 py-2  text-white ">
              Book stalls
            </a>
          </div>
        </Vortex>
      </div>
    </>
  );
}
