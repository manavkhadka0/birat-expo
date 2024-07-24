import ThreeDVideos from "@/components/3d-videos";
import AboutEvent from "@/components/about-event";
import {
  AttractionsSection,
  IntroSection,
  ObjectivesSection,
  SponsorshipSection,
} from "@/components/other-sections";
import StallsList from "@/components/stalls-list";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
        <div className="w-full md:w-1/2 flex flex-col gap-10 items-center md:items-start">
          <div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 uppercase">
              Birat Expo 2024
            </h2>
            <p className="tracking-[0.5rem]">Digital KOSHI</p>
            <p className="tracking-[0.5rem]">
              Bridging Innovation and Investment
            </p>
          </div>

          <StallsList />

          <div className="flex flex-col sm:flex-row items-center justify-start gap-4">
            <Link
              href="/all-stalls"
              className="px-4 py-2 text-black bg-gray-200 rounded-md hover:underline"
            >
              Event & Sponsorship Details
            </Link>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
          <Image
            src="/mascot.svg"
            alt="Birat Expo 2024"
            width={500}
            height={600}
            className="max-w-full h-auto"
          />
        </div>
      </div>

      <ThreeDVideos />
      {/* <div className="mb-12">
        <AboutEvent />
      </div> */}
      {/* <IntroSection /> */}
      <div className="py-10"></div>
      <ObjectivesSection />
      <div className="py-10"></div>
      <SponsorshipSection />
      <div className="py-10"></div>
      <AttractionsSection />
    </div>
  );
}
