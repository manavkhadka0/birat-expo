"use client";

import ParticipantsTable from "@/components/participants-table";

export default function LiveTrainingPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-3xl font-semibold text-gray-800 py-10">
          Live Training Dashboard
        </h1>

        {/* button tthat links to https://yachu.baliyoventures.com/api/export */}

        {/* <a
          href="https://yachu.baliyoventures.com/api/export"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Export Data
        </a> */}
      </div>
      <ParticipantsTable />
    </div>
  );
}
