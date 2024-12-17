"use client";

import { useGetAvailableSessions } from "@/api/training";
import TrainingRegistrationForm from "@/components/training-registration-form";

export default function LiveTrainingPage() {
  const { sessions, sessionsLoading, sessionsError } =
    useGetAvailableSessions();

  if (sessionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (sessionsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Failed to load available sessions. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Live Training Registration
      </h1>

      {sessions.length === 0 ? (
        <p className="text-center text-gray-600">
          No training sessions available at the moment.
        </p>
      ) : (
        <TrainingRegistrationForm topics={sessions} />
      )}
    </div>
  );
}
