"use client";

import { useGetThematicSessions } from "@/api/thematic";
import { ThematicSession } from "@/types/thematic";
import { CalendarDays, Clock, X } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { useState } from "react";

export default function ThematicSessions() {
  const { thematicSessions, thematicSessionsLoading } =
    useGetThematicSessions();
  const [selectedSession, setSelectedSession] =
    useState<ThematicSession | null>(null);

  const createMarkup = (html: string) => {
    return { __html: DOMPurify.sanitize(html) };
  };

  const truncateDescription = (description: string) => {
    const stripped = description.replace(/<[^>]*>/g, "");
    return stripped.length > 150 ? stripped.slice(0, 150) + "..." : stripped;
  };

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
          {thematicSessions.map((session) => (
            <div
              key={session.id}
              className="flex flex-col bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              onClick={() => setSelectedSession(session)}
            >
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900">
                  {session.title}
                </h3>
                <div className="mt-4 flex items-center">
                  <CalendarDays className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {session.date}
                  </span>
                </div>
                <div className="mt-2 flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>
                    {session.start_time} - {session.end_time}
                  </span>
                </div>
                <div className="mt-4 text-gray-600 text-lg">
                  {truncateDescription(session.description)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {selectedSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {selectedSession.title}
                  </h3>
                  <button
                    onClick={() => setSelectedSession(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="mt-4 flex items-center">
                  <CalendarDays className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {selectedSession.date}
                  </span>
                </div>
                <div className="mt-2 flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>
                    {selectedSession.start_time} - {selectedSession.end_time}
                  </span>
                </div>
                <div
                  className="mt-4 text-gray-600 text-lg prose max-w-none"
                  dangerouslySetInnerHTML={createMarkup(
                    selectedSession.description
                  )}
                />
              </div>
            </div>
          </div>
        )}

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
