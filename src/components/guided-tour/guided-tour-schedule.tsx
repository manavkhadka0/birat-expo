"use client";

import { TOUR_DATES } from "@/types/guided-tour";
import { useRouter } from "next/navigation";

const SCHEDULE_ITEMS = [
  {
    time: "10:00 AM",
    title: "Entry",
    description: "Registration and welcome",
  },
  {
    time: "10:05 - 10:20 AM",
    title: "First Session at CIM Centre for Excellence",
    description:
      "CIM designated expert will explain the available BDS services for industries",
    qa: "10-minute Q&A session",
  },
  {
    time: "10:30 - 11:00 AM",
    title: "Second Session at Vision Koshi Startup Hackathon Pavilion",
    description:
      "Explanation of startup innovation concepts, available ecosystem, lessons learned, incubation processes, CIM startup program, and registration opportunities for ideas",
  },
  {
    time: "11:05 - 11:30 AM",
    title: "Third Session at Rojgar Koshi Pavilion",
    description:
      "Observation of live training, exploration of current market demand, training, career paths, job matching, etc.",
  },
  {
    time: "11:30 - 12:00 PM",
    title: "Fourth Session at Digital Koshi Pavilion",
    description:
      "Observation of the latest IT and digital technologies, interaction with CAN Morang personnel",
  },
  {
    time: "12:00 - 12:30 PM",
    title: "Free Exploration",
    description: "Free time to explore Birat Expo 2025",
  },
];

export default function GuidedTourSchedule() {
  const router = useRouter();

  const handleDateClick = (date: string) => {
    router.push(`/guided-tour/register?date=${date}`);
  };

  return (
    <div id="schedule" className="bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Tour Schedule
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Daily schedule from January 24th to February 2nd, 2025
          </p>
        </div>

        {/* Available Dates */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-4">Available Dates</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {TOUR_DATES.map((date) => (
              <div
                key={date}
                onClick={() => handleDateClick(date)}
                className="bg-white p-4 rounded-lg shadow text-center cursor-pointer hover:bg-blue-50 transition-colors"
              >
                {new Date(date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Daily Schedule */}
        <div className="mt-16 space-y-8">
          <h3 className="text-xl font-semibold mb-6">Daily Schedule</h3>
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              {SCHEDULE_ITEMS.map((item, itemIdx) => (
                <li key={itemIdx}>
                  <div className="relative pb-8">
                    {itemIdx !== SCHEDULE_ITEMS.length - 1 ? (
                      <span
                        className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                          <span className="text-white text-sm">
                            {itemIdx + 1}
                          </span>
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.title}
                          </p>
                          <p className="mt-2 text-sm text-gray-500">
                            {item.description}
                          </p>
                          {item.qa && (
                            <p className="mt-1 text-sm text-blue-600">
                              {item.qa}
                            </p>
                          )}
                        </div>
                        <div className="whitespace-nowrap text-right text-sm text-gray-500">
                          <time>{item.time}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Eligibility Criteria */}
        <div className="mt-16 bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Eligibility Criteria</h3>
          <ul className="space-y-4 text-gray-600">
            <li className="flex items-start">
              <span className="font-medium mr-2">Who:</span> Students in College
              10+2 and above
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">When:</span> 10:00 AM to 12:00
              PM, daily from January 24th to February 2nd
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">How:</span> Participation is by
              pre-registration by colleges/schools. Each day, five colleges will
              be accommodated, and participation is on a first-come,
              first-served basis. This is a free entry event.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
