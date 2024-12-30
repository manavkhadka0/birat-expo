"use client";

import { useGetParticipants } from "@/api/participants";

export default function ParticipantPage() {
  const { participants, participantsLoading } = useGetParticipants();

  return (
    <div>
      <h1>Participants</h1>
      <pre>{JSON.stringify(participants, null, 2)}</pre>
    </div>
  );
}
