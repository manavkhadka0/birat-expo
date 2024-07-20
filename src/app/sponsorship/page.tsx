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
      <h1 className="text-4xl font-bold text-center mb-8">
        Sponsorship Levels
      </h1>
      {sponsorshipLevels.map((level, index) => (
        <div
          id={level.title.toLowerCase().replace(/ /g, "-")}
          key={index}
          className="scroll-offset mb-12 p-6 border rounded-lg shadow-lg bg-white"
        >
          <h2 className="text-3xl font-bold mb-4">{level.title}</h2>
          <p className="text-2xl text-blue-600 mb-4">{level.price}</p>
          <ul className="list-disc list-inside mb-4">
            {level.benefits.map((benefit, i) => (
              <li key={i} className="text-lg mb-2">
                {benefit}
              </li>
            ))}
          </ul>
          <Link
            href={`/sponsor-booking/${level.title
              .toLowerCase()
              .replace(/ /g, "-")}`}
          >
            <p className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg">
              Book Now {`${level.title}`}
            </p>
          </Link>
        </div>
      ))}
    </div>
  );
}
