"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export const navItems = [
  {
    title: "Book Stalls",
    items: [
      { title: "Automobiles Stalls", href: "/auto-bds-pavilion" },
      {
        title: "Business Development Service Providers",
        href: "/bds-pavilion",
      },
      {
        title: "Hanger 1 : Industrial and Corporate Stalls",
        href: "/hanger-1",
      },
      {
        title: "Hanger 2 : Industrial and Corporate Stalls",
        href: "/hanger-2",
      },
      {
        title: "Food Stalls",
        href: "/food-stalls",
      },
    ],
  },
  {
    title: "Sponsorships",
    href: "/sponsorship",
  },
  {
    title: "Live Training",
    href: "/live-training",
    className: "",
    rel: "",
    subtitle: "Offer till Magh 5",
    subtitleClass: "text-green-700",
  },
  {
    title: "Startup & Hackathon",
    href: "/startups-hackathon",
    subtitle: "Join Now",
    subtitleClass: "text-green-700",
  },
  {
    title: "Others",
    items: [
      { title: "Birat Expo'22", href: "/biratexpo-2022" },
      {
        title: "Organizer",
        href: "/organizer",
      },
      {
        title: "Floor Plan",
        href: "/floorplan",
      },
      {
        title: "Proposal",
        href: "/proposal",
      },
    ],
  },
  // about
];
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-white px-4 sticky shadow-2xl top-0 z-50">
      <div className="container mx-auto flex justify-between items-center h-20">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Birat Expo 2025"
            width={200}
            height={60}
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center justify-end space-x-4">
          {navItems.map((item, index) => (
            <div key={index} className="relative group">
              {item.items ? (
                <>
                  <button className="px-4 py-2 bg-white text-sm text-gray-900 font-semibold flex items-center hover:text-blue-600 transition-colors duration-200">
                    {item.title}
                    <svg
                      className="ml-2 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none invisible group-hover:visible transition-all duration-300 opacity-0 group-hover:opacity-100">
                    {item.items.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        href={subItem.href}
                        className="block px-4 py-2 text-sm text-gray-900 font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  href={item.href}
                  className={`px-4 py-2 bg-white text-sm text-gray-900 flex flex-col justify-center items-center hover:text-blue-600 transition-colors duration-200 ${
                    item.className || ""
                  }`}
                  rel={item.rel}
                >
                  {item.title}
                  {item.subtitle && (
                    <span
                      className={`text-[0.6rem] ${item.subtitleClass} leading-[0.3rem]`}
                    >
                      {item.subtitle}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden focus:outline-none" onClick={toggleMenu}>
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`bg-white h-full w-64 p-4 transform transition-transform duration-300 ease-in-out ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button className="mb-4 focus:outline-none" onClick={toggleMenu}>
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          {navItems.map((item, index) => (
            <div key={index} className="mb-4">
              <h3 className="font-semibold mb-2 text-gray-900">{item.title}</h3>
              {item.items ? (
                <ul className="pl-4">
                  {item.items.map((subItem, subIndex) => (
                    <li key={subIndex} className="mb-1">
                      <Link
                        href={subItem.href}
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
                      >
                        {subItem.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <Link
                  href={item.href}
                  className={`text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 ${
                    item.className || ""
                  }`}
                  rel={item.rel}
                >
                  {item.title}
                  {item.subtitle && (
                    <span
                      className={`text-[0.6rem] ${item.subtitleClass} leading-[0.3rem] ml-2`}
                    >
                      ({item.subtitle})
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
