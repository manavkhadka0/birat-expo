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

  const handleAvailableStallClick = (stallId: string) => {
    console.log("Available stall clicked:", stallId);
    router.push(`/book-stall/${stallId}`);
  };

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

        <header className="mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4">
            {title}
          </h1>
          <p className="text-xl text-gray-600">{subtitle}</p>
        </header>

        <section className="bg-white rounded-lg shadow-lg p-6 mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Stall Legend
          </h2>
          <StallLegend legendItems={legendItems} />
        </section>

        <section className="bg-white rounded-lg shadow-lg p-6 overflow-x-auto">
          <StallComponent
            {...stallProps}
            onAvailableStallClick={handleAvailableStallClick}
          />
        </section>
      </div>
    </main>
  );
};

export default StallArea;
