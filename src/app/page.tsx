import Image from "next/image";
import React from "react";

export default function Home() {
  return (
    <>
      <div className="mx-auto overflow-hidden">
        <div className="flex items-center gap-4 justify-between px-2 md:px-12 w-full">
          <div className="flex flex-col items-start justify-start w-1/2">
            <Image
              src="/title.png"
              alt="title"
              className="max-w-100"
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
              <a href="/all-stalls" className="px-4 py-2  text-black ">
                Event & Sponsorship Details
              </a>
            </div>
          </div>
          <div className="flex justify-end w-1/2">
            <Image
              src="/mascot.svg"
              alt="Birat Expo 2024"
              width={500}
              height={600}
            />
          </div>
        </div>
        <div className="flex items-center space-x-4 p-4 px-10">
          <div className="flex items-center bg-gray-100 rounded-lg p-3 flex-1">
            <span className="text-2xl mr-3">🎪</span>
            <span className="text-sm font-medium">Automobiles Stalls</span>
            <span className="ml-auto text-gray-400">›</span>
          </div>

          <div className="flex items-center bg-gray-100 rounded-lg p-3 flex-1">
            <span className="text-2xl mr-3">🎪</span>
            <span className="text-sm font-medium">BDS Stalls</span>
            <span className="ml-auto text-gray-400">›</span>
          </div>

          <div className="flex items-center bg-gray-100 rounded-lg p-3 flex-1">
            <span className="text-2xl mr-3">🎪</span>
            <span className="text-sm font-medium">
              Hanger 1 : Industrial and Corporate Stalls
            </span>
            <span className="ml-auto text-gray-400">›</span>
          </div>
        </div>
        <div className="flex items-center space-x-4 p-4 px-10">
          <div className="flex items-center bg-gray-100 rounded-lg p-3 flex-1">
            <span className="text-2xl mr-3">🎪</span>
            <span className="text-sm font-medium">
              Hanger 2 : Industrial and Corporate Stalls
            </span>
            <span className="ml-auto text-gray-400">›</span>
          </div>
          <div className="flex items-center bg-gray-100 rounded-lg p-3 flex-1">
            <span className="text-2xl mr-3">🎪</span>
            <span className="text-sm font-medium">Agro and SME Stalls</span>
            <span className="ml-auto text-gray-400">›</span>
          </div>
          <div className="flex items-center bg-gray-100 rounded-lg p-3 flex-1">
            <span className="text-2xl mr-3">🎪</span>
            <span className="text-sm font-medium">Food Stalls</span>
            <span className="ml-auto text-gray-400">›</span>
          </div>
        </div>
        <div className="px-10">
          <img src="/12.jpg" alt="Birat Expo 2024" className="mx-w-100 my-20" />
          {/* <img src="/13.png" alt="Birat Expo 2024" className="mx-w-100 my-20" />
          <img src="/14.png" alt="Birat Expo 2024" className="mx-w-100 my-20" />
          <img src="/15.png" alt="Birat Expo 2024" className="mx-w-100 my-20" />
          <img src="/16.png" alt="Birat Expo 2024" className="mx-w-100 my-20" /> */}
        </div>
      </div>
    </>
  );
}
