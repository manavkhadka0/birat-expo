import Image from "next/image";
import React from "react";

const ContactInformation = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-500">
      <div className=" container text-white p-6 md:p-8 rounded-t-3xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">
          Chamber of Industries, Morang
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="font-semibold">PHONE:</p>
            <a href="tel:021515712" className="hover:underline">
              021-515712
            </a>
            ,
            <a href="tel:577646" className="hover:underline">
              577646
            </a>
          </div>
          <div>
            <p className="font-semibold">WEB:</p>
            <a
              href="http://www.cim.org.np"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              WWW.CIM.ORG.NP
            </a>
          </div>
          <div>
            <p className="font-semibold">MAIL:</p>
            <a
              href="mailto:cim.biratnagar@gmail.com"
              className="hover:underline"
            >
              CIM.BIRATNAGAR@GMAIL.COM
            </a>
          </div>
          <div>
            <p className="font-semibold">ADDRESS:</p>
            <p>SHAHID MARGA, TINPAINI, BIRATNAGAR-2</p>
          </div>
        </div>

        <h2 className="text-xl md:text-2xl font-bold mb-8">Contact Persons</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="text-left">
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden mb-3">
              <Image
                src="/WhatsApp Image 2024-05-30 at 11.18.03.jpeg"
                alt="Mr. Bholeshwor Dulal"
                layout="fill"
                objectFit="cover"
              />
            </div>
            <h3 className="font-bold">Mr. Rakesh Surana</h3>
            <p className="text-sm">President, Chamber of Industries Morang</p>
            <a href="tel:9852020051" className="text-sm hover:underline">
              Mobile 9852020051
            </a>
          </div>
          <div className="text-left">
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden mb-3">
              <Image
                src="/WhatsApp Image 2024-05-30 at 11.17.46.jpeg"
                alt="Mr. Bholeshwor Dulal"
                layout="fill"
                objectFit="cover"
              />
            </div>
            <h3 className="font-bold">Mr. Bholeshwor Dulal</h3>
            <p className="text-sm">
              Vice President & Coordinator Birat Expo 2024
            </p>
            <a href="tel:9851131915" className="text-sm hover:underline">
              Mobile 9851131915
            </a>
          </div>
          <div className="text-left">
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden mb-3">
              <Image
                src="/Parash Luniya.jpeg"
                alt="Mr. Bholeshwor Dulal"
                layout="fill"
                objectFit="cover"
              />
            </div>
            <h3 className="font-bold">Mr. Paras Luniya</h3>
            <p className="text-sm">
              Executive member & Co-Coordinator Birat Expo 2024
            </p>
            <a href="tel:9802771077" className="text-sm hover:underline">
              Mobile 9802771077
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInformation;
