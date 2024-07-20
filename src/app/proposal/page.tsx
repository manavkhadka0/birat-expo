"use client";

export default function Proposal() {
  return (
    <div className="pt-20 pb-40 flex justify-center">
      <div className="flex justify-center flex-col items-center">
        <h2 className="text-4xl sm:text-5xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 uppercase mb-10">
          Birat Expo 2024 Proposal
        </h2>
        <object
          className="pdf"
          data="/Birat Expo 2024 - Proposal.pdf"
          width="800"
          height="750"
        ></object>
      </div>
    </div>
  );
}
