"use client";

import { useGetThematicSessions } from "@/api/thematic";
import { ThematicSession } from "@/types/thematic";
import { useState } from "react";
import { SessionCard } from "./components/session-card";
import { SessionModal } from "./components/session-modal";

export default function ThematicSessions() {
  const { thematicSessions, thematicSessionsLoading } =
    useGetThematicSessions();
  const [selectedSession, setSelectedSession] =
    useState<ThematicSession | null>(null);

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">
            Thematic Areas
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Explore our comprehensive thematic sessions addressing practical and
            comprehensive issues
          </p>
        </div>

        {/* Sessions Grid */}
        {thematicSessionsLoading ? (
          <div className="mt-16 grid place-items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            {thematicSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onClick={setSelectedSession}
              />
            ))}
          </div>
        )}

        {/* Registration CTA */}
        <div className="mt-20 text-center">
          <div className="space-y-6">
            <p className="text-gray-600 max-w-2xl mx-auto">
              Activities include Startup Hackathon, Rojagar Koshi live training
              for youths, Business Clinic, Q-HSEF, B2B sessions, and various
              thematic discussions.
            </p>
            <a
              href="/thematic/register"
              className="inline-flex items-center px-8 py-4 text-lg rounded-full text-white font-medium 
                     bg-gradient-to-r from-blue-600 to-violet-600 
                     hover:from-blue-700 hover:to-violet-700 
                     transition-all duration-200 shadow-lg hover:shadow-xl
                     transform hover:-translate-y-1"
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

        {/* Modal */}
        {selectedSession && (
          <SessionModal
            session={selectedSession}
            onClose={() => setSelectedSession(null)}
          />
        )}
      </div>
    </section>
  );
}
