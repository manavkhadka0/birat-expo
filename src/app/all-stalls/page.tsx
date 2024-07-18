"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type ElegantCardProps = {
  title: string;
  href: string;
  description: string;
  imageSrc: string;
};
const ElegantCard = ({
  title,
  href,
  description,
  imageSrc,
}: ElegantCardProps) => (
  <Link href={href} className="group">
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
      </div>
      <div className="bg-gray-100 p-4 flex items-center justify-center h-48">
        <Image
          src={imageSrc}
          alt={title}
          width={400}
          height={400}
          objectFit="contain"
          className="transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    </div>
  </Link>
);

const cardItems = [
  {
    title: "Auto / Business Development Service Pavilion",
    href: "/auto-bds-pavilion",
    description: "Explore automobile and business development services",
    imageSrc: "/1.svg",
  },
  {
    title: "Hanger 1 - Industrial and Corporate Stalls",
    href: "/hanger-1",
    description: "Discover industrial and corporate exhibitors",
    imageSrc: "/hanger-1.svg",
  },
  {
    title: "Hanger 2 - Industrial and Corporate Stalls",
    href: "/hanger-2",
    description: "More industrial and corporate exhibitions",
    imageSrc: "/hanger-2.svg",
  },
  {
    title: "Hanger 3 - Agro and SME Stalls",
    href: "/hanger-3",
    description: "Agriculture and small-medium enterprise showcase",
    imageSrc: "/hanger-3.svg",
  },
  {
    title: "Food Stalls",
    href: "/food-stalls",
    description: "Savor delicious food and beverages",
    imageSrc: "/food.svg",
  },
  {
    title: "Sponsors Pavilion",
    href: "/sponsors-pavilion",
    description: "Meet our esteemed sponsors",
    imageSrc: "/sponsors.svg",
  },
];

export default function ElegantExpoLayout() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <nav className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 transition duration-300 ease-in-out"
          >
            ← Back to Home
          </Link>
        </nav>
        <header className="mb-16 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            Birat Expo 2024
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our innovative stall layouts and secure your space at this
            year&apos;s most anticipated event
          </p>
        </header>
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cardItems.map((item, index) => (
            <ElegantCard key={index} {...item} />
          ))}
        </section>
      </div>
    </main>
  );
}
