"use client";

import { useGetAvailableSessions } from "@/api/training";
import Programs from "@/components/live-training/programs";
import TrainingPartners from "@/components/live-training/training-partners";
import Hero from "@/components/live-training/hero";
import LiveTrainingHero from "@/components/live-training/live-training-hero";
import { Loader } from "lucide-react";
import Image from "next/image";

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
      <LiveTrainingHero />

      {/* Programs Section */}
      <Programs sessions={sessions} />

      {/* Training Partners Section */}
      <TrainingPartners />

      {/* Live Training Partner Section */}
      <div className="py-12 container mt-auto">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-indigo-500 to-violet-700 bg-clip-text text-transparent"></h2>

        <div className="flex justify-center">
          <Image
            src="/LiveTraining.svg" // Replace with your image path
            alt="Live Training Partner"
            width={500}
            height={400}
            className="h-auto w-auto"
            priority
          />
        </div>
      </div>

      <Hero />
    </>
  );
}
