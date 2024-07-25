"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import StallLegend from "@/components/stall-legend";

type StallAreaProps = {
  title: string;
  legendItems: { color: string; label: string }[];
  StallComponent: React.FC<any>;
  stallProps: any;
};

const StallArea = ({
  title,
  legendItems,
  StallComponent,
  stallProps,
}: StallAreaProps) => {
  const router = useRouter();

  return (
    <main className=" bg-gradient-to-b from-gray-50 to-gray-100 pb-40">
      <div className="container mx-auto px-4 py-5 sm:px-6 lg:px-8">
        <nav className="mb-12 mt-3 flex items-center justify-start gap-4">
          <Link
            href="/"
            className="text-gray-600 hover:text-blue-800 transition duration-300 ease-in-out border border-gray-800 px-2 py-1 text-sm rounded-lg"
          >
            ← Back to Home
          </Link>
          <header>
            <h1 className="text-xl sm:text-2xl md:text-2xl  font-extrabold text-gray-900 ">
              {title}
            </h1>
          </header>
        </nav>

        <section className="bg-white rounded-lg shadow-lg p-6 overflow-x-auto pb-20">
          <StallLegend legendItems={legendItems} />
          <div className="my-5"></div>
          <StallComponent
            {...stallProps}
            onAvailableStallClick={stallProps.onAvailableStallClick}
          />
        </section>
      </div>
    </main>
  );
};

export default StallArea;
