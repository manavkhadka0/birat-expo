"use client";

export default function Proposal() {
  return (
    <>
      <div className="pt-20 pb-40 flex justify-center">
        <div className="flex justify-center flex-col items-center">
          <h2 className="text-4xl sm:text-5xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 uppercase mb-10">
            Birat Expo 2025 Proposal
          </h2>
          <div className="flex justify-center my-6">
            <a
              href="/Contract_Sponsorships_Birat_Expo_2024.docx.pdf"
              download
              className="px-4 py-2 text-white bg-blue-600 rounded-md no-underline"
            >
              Download SponsorShip Contract
            </a>
          </div>
          <object
            className="pdf"
            data="/Birat Expo 2025 - Proposal.pdf"
            width="800"
            height="750"
          ></object>
        </div>
        {/* Download Sponsorship Contract */}
      </div>
    </>
  );
}
