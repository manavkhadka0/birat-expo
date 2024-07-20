"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import StallLegend from "@/components/stall-legend";

type StallAreaProps = {
  title: string;
  subtitle: string;
  legendItems: { color: string; label: string }[];
  StallComponent: React.FC<any>;
  stallProps: any;
};

const StallArea = ({
  title,
  subtitle,
  legendItems,
  StallComponent,
  stallProps,
}: StallAreaProps) => {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <nav className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 transition duration-300 ease-in-out"
          >
            ← Back to Home
          </Link>
        </nav>

        <header className="mb-12 ">
          <h1 className="text-xl sm:text-2xl md:text-3xl  font-extrabold text-gray-900 mb-4">
            {title}
          </h1>
          <p className="text-xl text-gray-600">{subtitle}</p>
        </header>

        <StallLegend legendItems={legendItems} />

        <section className="bg-white rounded-lg shadow-lg p-6 overflow-x-auto">
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
