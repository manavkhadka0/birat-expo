import ThreeDVideos from "@/components/3d-videos";
import AboutEvent from "@/components/about-event";
import {
  AttractionsSection,
  IntroSection,
  ObjectivesSection,
  SponsorshipSection,
} from "@/components/other-sections";
import StallsList from "@/components/stalls-list";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
        <div className="w-full md:w-1/2 flex flex-col gap-10 items-center md:items-start">
          <div className="flex items-center  space-x-4">
            <Image
              src="/1.png"
              alt="Baliyo Ventures"
              width={100}
              height={50}
              className="rounded-full bg-white"
            />
            <Image
              src="/2.png"
              alt="Baliyo Ventures"
              width={100}
              height={50}
              className="rounded-md"
            />
          </div>
          <div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 uppercase">
              Birat Expo 2025
            </h2>
            <p className="tracking-[0.2rem]">
              Digital KOSHI: Bridging Innovation and Investment
            </p>
            <div className="border-t-4 border-blue-500 my-2"></div>
            <p className="tracking-[0.2rem] ">
              Date: 24<sup>th</sup> Jan - 2<sup>nd</sup> Feb 2025
            </p>
            <p className="tracking-[0.2rem]">
              Venue: Degree Campus, Biratnagar
            </p>
          </div>

          <StallsList />

          <div className="flex flex-col sm:flex-row items-center justify-start gap-4">
            <Link
              href="/all-stalls"
              className="px-4 py-2 text-black bg-gray-200 rounded-md hover:underline"
            >
              Event & Sponsorship Details
            </Link>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
          <Image
            src="/mascot.svg"
            alt="Birat Expo 2025"
            width={500}
            height={600}
            className="max-w-full h-auto"
          />
        </div>
      </div>

      <ThreeDVideos />
      {/* <div className="mb-12">
        <AboutEvent />
      </div> */}
      {/* <IntroSection /> */}
      <div className="py-10"></div>
      <ObjectivesSection />
      {/* <div className="py-10"></div> */}
      {/* <SponsorshipSection /> */}
      <div className="py-10">
        {/* <img src="/12.jpg" alt="Birat Expo 2025" className="mx-w-100 my-20" /> */}
        <img src="/13.png" alt="Birat Expo 2025" className="mx-w-100 my-20" />
        <img src="/14.png" alt="Birat Expo 2025" className="mx-w-100 my-20" />
        <img src="/15.png" alt="Birat Expo 2025" className="mx-w-100 my-20" />
        <img src="/16.png" alt="Birat Expo 2025" className="mx-w-100 my-20" />
      </div>
      <div className="py-10"></div>
      <AttractionsSection />
      <div className="py-10"></div>
      <DayPlans />
      <div className="py-10"></div>
      <div className="flex flex-col justify-center items-center">
        <h2 className="text-4xl text-center font-black  justify-center flex items-center mb-5  ps-2 text-gray-800">
          Event Venue (Degree Campus, Biratnagar)
        </h2>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3572.584543207205!2d87.27909107542315!3d26.436880476933897!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ef75b5926eae87%3A0xeec78592c4d9be76!2sDegree%20Campus%2C%20Biratnagar!5e0!3m2!1sen!2snp!4v1721831728361!5m2!1sen!2snp"
          width="600"
          height="450"
          style={{
            border: 0,
            width: "100%",
            height: "450px",
          }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  );
}

const DayPlans = () => (
  <section className="mb-16 container">
    <h2 className="text-4xl font-black text-start mb-5 border-l-[5px] ps-2 border-blue-800 text-gray-800">
      Proposed 10 Days Plan
    </h2>
    <img
      src="/day-plan-1.png"
      alt="Birat Expo 2025"
      className="w-full mx-auto"
    />
    <img
      src="/day-plan-2.png"
      alt="Birat Expo 2025"
      className="w-full mx-auto"
    />
  </section>
);
