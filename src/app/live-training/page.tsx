"use client";

import { useGetAvailableSessions } from "@/api/training";
import Programs from "@/components/live-training/programs";
import TrainingPartners from "@/components/live-training/training-partners";
import Hero from "@/components/live-training/hero";
import LiveTrainingHero from "@/components/live-training/live-training-hero";
import { Loader } from "lucide-react";

export default function LiveTrainingPage() {
  const { sessions, sessionsLoading } = useGetAvailableSessions();

  if (sessionsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <LiveTrainingHero sessions={sessions} />

      <Programs sessions={sessions} />
      <TrainingPartners />

      <Hero />
    </>
  );
}
