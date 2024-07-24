"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { navItems } from "./navbar";
import ContactInformation from "./contact-information";

const Footer = () => {
  const [expandedSection, setExpandedSection] = useState<null | number>(null);

  return (
    <>
      <ContactInformation />
      <footer className="bg-white border-t text-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Quick Links</h2>
              {navItems.map((item, index) => (
                <div key={index} className="mb-4">
                  {item.items ? (
                    <div>
                      <button
                        onClick={() =>
                          setExpandedSection(
                            expandedSection === index ? null : index
                          )
                        }
                        className="flex items-center justify-between w-full text-left font-semibold"
                      >
                        {item.title}
                        <svg
                          className={`w-4 h-4 transition-transform ${
                            expandedSection === index
                              ? "transform rotate-180"
                              : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {expandedSection === index && (
                        <ul className="mt-2 space-y-2 pl-4">
                          {item.items.map((subItem, subIndex) => (
                            <li key={subIndex}>
                              <Link
                                href={subItem.href}
                                className="text-sm hover:text-blue-600 transition-colors"
                              >
                                {subItem.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={`block text-sm hover:text-blue-600 transition-colors ${
                        item.className || ""
                      }`}
                      rel={item.rel}
                    >
                      {item.title}
                      {item.subtitle && (
                        <span className={`text-xs ${item.subtitleClass} ml-2`}>
                          ({item.subtitle})
                        </span>
                      )}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Organizer</h2>
              <div className="flex items-center space-x-4">
                <Image
                  src="/1.png"
                  alt="Baliyo Ventures"
                  width={100}
                  height={50}
                  className="rounded-md"
                />
              </div>
              <h2 className="text-2xl font-bold mb-4">Technical Partner</h2>
              <Link
                href="https://baliyoventures.com"
                className="group block hover:bg-white "
              >
                <div className="flex items-center space-x-4">
                  <Image
                    src="/baliyo-logo.svg"
                    alt="Baliyo Ventures"
                    width={100}
                    height={50}
                    className="rounded-md"
                  />
                </div>
              </Link>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
              <address className="not-italic">
                <p>Chamber of Industries Morang</p>
                <p>Shahid Marga, Tinpaini, Biratnagar-2</p>
                <p>Phone: 021-515712, 577646</p>
                <p>Email: cim.biratnagar@gmail.com</p>
              </address>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
