// pages/sponsorship.js
"use client";

import { sponsorshipLevels } from "@/components/other-sections";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Sponsorship() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.includes("#")) {
      const hash = pathname.split("#")[1];
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
    }
  }, [pathname]);

  return (
    <div className="container mx-auto py-12">
      <h2 className="text-4xl font-black text-start border-l-[5px] ps-2 border-blue-800 text-gray-800 mb-10">
        Sponsorship <span className="text-blue-500">Opportunity</span>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {sponsorshipLevels.map((level, index) => (
          <div
            id={level.title.toLowerCase().replace(/ /g, "-")}
            key={index}
            className="scroll-offset rounded-lg bg-white mb-20 lg:mb-40"
          >
            <span className="text-sm font-bold uppercase p-4 bg-[#0F5E9F] mb-10 text-white">
              {level.title} : {level.price}
            </span>
            <ul className="list-disc list-inside mt-10 mb-4">
              {level.benefits.map((benefit, i) => (
                <li key={i} className="text-lg mb-2">
                  {benefit}
                </li>
              ))}
            </ul>
            {/* <Link
            href={`/sponsor-booking/${level.title
              .toLowerCase()
              .replace(/ /g, "-")}`}
          >
            <p className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg">
              Book Now {`${level.title}`}
            </p>
          </Link> */}
          </div>
        ))}
      </div>
      <div className="flex justify-center flex-col items-center">
        <h2 className="text-4xl sm:text-5xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 uppercase mb-10">
          Birat Expo 2024 Proposal
        </h2>
        <div className="flex justify-center my-6">
          <a
            href="/Contract_Sponsorships_Birat_Expo_2024.docx.pdf"
            download
            className="px-4 py-2 text-white bg-blue-600 rounded-md no-underline"
          >
            Download Sponsorship Contract
          </a>
        </div>
        <object
          className="pdf"
          data="/Birat Expo 2024 - Proposal.pdf"
          width="800"
          height="750"
        ></object>
      </div>
    </div>
  );
}
