import AboutEvent from "@/components/about-event";
import {
  AttractionsSection,
  IntroSection,
  ObjectivesSection,
  SponsorshipSection,
} from "@/components/other-sections";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Home() {
  const stalls = [
    { emoji: "🎪", name: "Automobiles Stalls", href: "/auto-bds-pavilion" },
    { emoji: "🎪", name: "BDS Stalls", href: "/auto-bds-pavilion" },
    {
      emoji: "🎪",
      name: "Hanger 1 : Industrial and Corporate Stalls",
      href: "/hanger-1",
    },
    {
      emoji: "🎪",
      name: "Hanger 2 : Industrial and Corporate Stalls",
      href: "/hanger-2",
    },
    { emoji: "🎪", name: "Agro and SME Stalls", href: "/hanger-3" },
    { emoji: "🎪", name: "Food Stalls", href: "/food-stalls" },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start">
          <Image
            src="/title.png"
            alt="title"
            className="max-w-full h-auto"
            width={300}
            height={500}
          />
          <div className="flex flex-col sm:flex-row items-center justify-start gap-4 mt-6">
            <a
              href="/floor-plan.pdf"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition duration-200 rounded-lg text-white shadow-[0px_2px_0px_0px_#FFFFFF40_inset]"
            >
              Book Stalls
            </a>
            <Link
              href="/all-stalls"
              className="px-4 py-2 text-black hover:underline"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {stalls.map((stall, index) => (
          <Link href={stall.href} key={index}>
            <div className="flex items-center bg-gray-100 rounded-lg p-3 hover:bg-gray-200 transition duration-200">
              <span className="text-2xl mr-3">{stall.emoji}</span>
              <span className="text-sm font-medium flex-grow">
                {stall.name}
              </span>
              <span className="text-gray-400">›</span>
            </div>
          </Link>
        ))}
      </div>
      <div className="mb-12">
        <AboutEvent />
      </div>
      <IntroSection />
      <ObjectivesSection />
      <SponsorshipSection />
      <AttractionsSection />
    </div>
  );
}
