"use client";

import Image from "next/image";
import { useGetAvailableSessions } from "@/api/training";
import TrainingRegistrationForm from "@/components/training-registration-form";
import Programs from "@/components/live-training/programs";
import TrainingPartners from "@/components/live-training/training-partners";
import Hero from "@/components/live-training/hero";
import LiveTrainingHero from "@/components/live-training/live-training-hero";

export default function LiveTrainingPage() {
  return (
    <>
      {/* Hero Section */}
      <LiveTrainingHero />

      <Programs />
      <TrainingPartners />

      <Hero />
    </>
  );
}
