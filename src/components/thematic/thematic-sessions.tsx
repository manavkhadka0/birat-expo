import { THEMATIC_SESSIONS, ThematicSession } from "@/types/thematic";
import { CalendarDays, Clock } from "lucide-react";

export default function ThematicSessions() {
  return (
    <div className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Thematic Areas
          </h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            Explore our comprehensive thematic sessions addressing practical and
            comprehensive issues
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          {THEMATIC_SESSIONS.map((session) => (
            <div
              key={session.id}
              className="flex flex-col bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900">
                  {session.title}
                </h3>
                <div className="mt-4 flex items-center text-gray-600">
                  <CalendarDays className="h-5 w-5 mr-2" />
                  <span>{session.date}</span>
                </div>
                <div className="mt-2 flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>{session.time}</span>
                </div>
                <p className="mt-4 text-gray-600 text-lg">
                  {session.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <div className="space-y-4">
            <p className="text-gray-600">
              Activities include Startup Hackathon, Rojagar Koshi live training
              for youths, Business Clinic, Q-HSEF, B2B sessions, and various
              thematic discussions.
            </p>
            <a
              href="/thematic/register"
              className="inline-flex items-center px-8 py-4 text-lg rounded-full text-white font-medium 
              bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 
              hover:from-indigo-600 hover:via-indigo-700 hover:to-violet-700 
              transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Register for Sessions
              <svg
                className="w-6 h-6 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
