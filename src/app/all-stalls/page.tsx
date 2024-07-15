"use client";
import { PinContainer } from "@/components/ui/3d-pin";
import Image from "next/image";
import React from "react";

export default function AnimatedPinDemo() {
  return (
    <div className="py-20 container">
      <div className="py-6">
        <a href="/" className="text-black">
          Back to Home
        </a>
      </div>
      <h2 className="text-gray-800 text-2xl md:text-6xl font-bold ">
        Welcome to Birat Expo 2024 Stall booking portal
      </h2>
      <p className="text-gray-800 text-sm md:text-2xl  mt-6 ">
        Click the buttons below to view our stall layout and book a stall
      </p>
      <div className="h-[40rem] w-full flex flex-wrap gap-16 items-center py-20 justify-center ">
        <PinContainer title="Auto BDS Pavilion" href="/auto-bds-pavilion">
          <div className="flex basis-full flex-col p-4 tracking-tight text-slate-100/50 sm:basis-1/2 w-[20rem] h-[20rem] ">
            <h3 className="max-w-xs !pb-2 !m-0 font-bold  text-base text-slate-100">
              Auto / Business Development Service Pavilion
            </h3>
            <div className="text-base !m-0 !p-0 font-normal">
              <span className="text-slate-500 ">
                A pavilion for showcasing the latest in automotive technology
                and innovation.
              </span>
            </div>
            <Image
              src="/1.svg"
              className="flex flex-1 w-full p-2 z-50 bg-red-50 rounded-md"
              alt="Auto BDS Pavilion"
              width={200}
              height={200}
            />
          </div>
        </PinContainer>{" "}
        <PinContainer
          title="Hanger 1- Industrial and Coporate Stalls"
          href="/hanger-1"
        >
          <div className="flex basis-full flex-col p-4 tracking-tight text-slate-100/50 sm:basis-1/2 w-[20rem] h-[20rem] ">
            <h3 className="max-w-xs !pb-2 !m-0 font-bold  text-base text-slate-100">
              Hanger 1- Industrial and Coporate Stalls
            </h3>
            <div className="text-base !m-0 !p-0 font-normal">
              <span className="text-slate-500 ">
                Stalls for industrial and corporate exhibitors.
              </span>
            </div>
            <Image
              src="/hanger-1.svg"
              className="flex flex-1 w-full p-2 z-50 bg-red-50 rounded-md"
              alt="Auto BDS Pavilion"
              width={200}
              height={200}
            />
          </div>
        </PinContainer>{" "}
        <PinContainer
          title="Hanger 2- Industrial and Coporate Stalls"
          href="/hanger-2"
        >
          <div className="flex basis-full flex-col p-4 tracking-tight text-slate-100/50 sm:basis-1/2 w-[20rem] h-[20rem] ">
            <h3 className="max-w-xs !pb-2 !m-0 font-bold  text-base text-slate-100">
              Hanger 2- Industrial and Coporate Stalls
            </h3>
            <div className="text-base !m-0 !p-0 font-normal">
              <span className="text-slate-500 ">
                Stalls for industrial and corporate exhibitors.
              </span>
            </div>
            <Image
              src="/hanger-2.svg"
              className="flex flex-1 w-full p-2 z-50 bg-red-50 rounded-md"
              alt="Auto BDS Pavilion"
              width={200}
              height={200}
            />
          </div>
        </PinContainer>{" "}
        <PinContainer title="Hanger 3- Agro and SME Stalls" href="/hanger-3">
          <div className="flex basis-full flex-col p-4 tracking-tight text-slate-100/50 sm:basis-1/2 w-[20rem] h-[20rem] ">
            <h3 className="max-w-xs !pb-2 !m-0 font-bold  text-base text-slate-100">
              Hanger 3- Agro and SME Stalls
            </h3>
            <div className="text-base !m-0 !p-0 font-normal">
              <span className="text-slate-500 ">
                Stalls for agriculture and small and medium enterprises.
              </span>
            </div>
            <Image
              src="/hanger-3.svg"
              className="flex flex-1 w-full p-2 z-50 bg-red-50 rounded-md"
              alt="Auto BDS Pavilion"
              width={200}
              height={200}
            />
          </div>
        </PinContainer>{" "}
        <PinContainer title="Food Stalls" href="/food-stalls">
          <div className="flex basis-full flex-col p-4 tracking-tight text-slate-100/50 sm:basis-1/2 w-[20rem] h-[20rem] ">
            <h3 className="max-w-xs !pb-2 !m-0 font-bold  text-base text-slate-100">
              Food Stalls
            </h3>
            <div className="text-base !m-0 !p-0 font-normal">
              <span className="text-slate-500 ">
                Stalls for food and beverages.
              </span>
            </div>
            <Image
              src="/food.svg"
              className="flex flex-1 w-full p-2 z-50 bg-red-50 rounded-md"
              alt="Auto BDS Pavilion"
              width={200}
              height={100}
            />
          </div>
        </PinContainer>
        <PinContainer title="Sponsors Pavilion" href="/sponsors-pavilion">
          <div className="flex basis-full flex-col p-4 tracking-tight text-slate-100/50 sm:basis-1/2 w-[20rem] h-[20rem] ">
            <h3 className="max-w-xs !pb-2 !m-0 font-bold  text-base text-slate-100">
              Sponsors Pavilion
            </h3>
            <div className="text-base !m-0 !p-0 font-normal">
              <span className="text-slate-500 ">Pavilion for sponsors.</span>
            </div>
            <Image
              src="/sponsors.svg"
              className="flex flex-1 w-full p-2 z-50 bg-red-50 rounded-md"
              alt="Auto BDS Pavilion"
              width={200}
              height={100}
            />
          </div>
        </PinContainer>
      </div>
    </div>
  );
}
