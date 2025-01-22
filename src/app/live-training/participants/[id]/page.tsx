"use client";

import { useGetEachParticipant } from "@/api/participants";
import { useState } from "react";

export default function ParticipantPage({
  params,
}: {
  params: { id: string };
}) {
  const { participant, participantLoading } = useGetEachParticipant(
    parseInt(params.id)
  );
  const [isAttending, setIsAttending] = useState(false);

  const handleAttendance = async () => {
    try {
      setIsAttending(true);
      const response = await fetch(
        `https://yachu.baliyoventures.com/api/registrations/${params.id}/attendance/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) throw new Error("Failed to mark attendance");

      // Refresh the page to show updated status
      window.location.reload();
    } catch (error) {
      console.error("Error marking attendance:", error);
    } finally {
      setIsAttending(false);
    }
  };

  if (participantLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Participant not found
          </h2>
          <p className="text-gray-600">
            The requested participant could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {participant.first_name[0]}
                  {participant.last_name[0]}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {participant.first_name} {participant.last_name}
                </h1>
                <p className="text-gray-500">{participant.email}</p>
              </div>
            </div>
            <button
              onClick={handleAttendance}
              disabled={participant.is_attended || isAttending}
              className={`px-6 py-3 rounded-lg text-white font-medium ${
                participant.is_attended
                  ? "bg-green-500 cursor-not-allowed"
                  : isAttending
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {participant.is_attended
                ? "Already Attended"
                : isAttending
                ? "Processing..."
                : "Mark Attendance"}
            </button>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Phone</label>
                <p className="text-gray-900">{participant.mobile_number}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Address</label>
                <p className="text-gray-900">{participant.address}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Gender</label>
                <p className="text-gray-900">{participant.gender}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Age</label>
                <p className="text-gray-900">{participant.age}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Qualification</label>
                <p className="text-gray-900">{participant.qualification}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Training Details */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Training Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Topic</label>
                <p className="text-gray-900">
                  {participant.time_slot.topic.name}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Time Slot</label>
                <p className="text-gray-900">
                  {new Date(participant.time_slot.date).toLocaleDateString()}{" "}
                  {participant.time_slot.start_time} -{" "}
                  {participant.time_slot.end_time}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">
                  Registration Type
                </label>
                <p className="text-gray-900">{participant.registration_type}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Status</label>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      participant.is_attended
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {participant.is_attended ? "Attended" : "Not Attended"}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      participant.status === "Confirmed"
                        ? "bg-green-100 text-green-800"
                        : participant.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {participant.status}
                  </span>
                </div>
              </div>
              {participant.group_members.length > 0 && (
                <div>
                  <label className="text-sm text-gray-500">Group Members</label>
                  <div className="mt-1 space-y-1">
                    {participant.group_members.map(
                      (member: any, index: number) => (
                        <p key={index} className="text-gray-900">
                          {member.name}
                        </p>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
