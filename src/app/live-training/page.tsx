"use client";

import Image from "next/image";
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative min-h-[600px] lg:h-[700px] w-full">
        <Image
          src="/training-hero.jpg"
          alt="Training Hero"
          fill
          priority
          className="object-cover brightness-50"
        />
        <div className="absolute inset-0 container mx-auto px-4 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
          <div className="text-white text-center lg:text-left z-10 lg:flex-1">
            <h1 className="text-4xl lg:text-6xl font-bold mb-4">
              ROJGAR KOSHI
            </h1>
            <p className="text-xl lg:text-2xl mb-6">
              Crafting Careers, Shaping Futures
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <a
                href="#live-training-contact-card"
                className="bg-white hover:bg-gray-100 text-blue-600 px-6 py-3 rounded-lg transition"
              >
                Contact Us
              </a>
            </div>
          </div>
          <div className="lg:flex-1 flex justify-center lg:justify-end">
            <div className="relative w-[200px] h-[200px] lg:w-[400px] lg:h-[400px]">
              <Image
                src="/sarathi.jpg"
                alt="Sarathi"
                fill
                className="rounded-full border-4 border-white object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Our Training Partners
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="relative h-[400px] rounded-xl overflow-hidden group">
            <Image
              src="/training-1.jpg"
              alt="Hospitality Training"
              fill
              className="object-cover transition-transform group-hover:scale-110"
            />
            <div className="absolute -bottom-10 inset-0 bg-black/10"></div>
          </div>
          <div className="relative h-[400px] rounded-xl overflow-hidden group">
            <Image
              src="/training-2.jpg"
              alt="IT Training"
              fill
              className="object-cover transition-transform group-hover:scale-110"
            />
            <div className="absolute -bottom-10 inset-0 bg-black/10"></div>
          </div>
        </div>

        {/* Our Traning Partner */}
      </div>

      {/* Training Categories */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Our Training Programs
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="relative h-[400px] rounded-xl overflow-hidden group">
            <Image
              src="/training-4.jpg"
              alt="Hospitality Training"
              fill
              className="object-cover transition-transform group-hover:scale-110"
            />
            <div className="absolute -bottom-10 inset-0 bg-black/10"></div>
          </div>
          <div className="relative h-[400px] rounded-xl overflow-hidden group">
            <Image
              src="/training-3.jpg"
              alt="Electronics Training"
              fill
              className="object-cover transition-transform group-hover:scale-110"
            />
            <div className="absolute -bottom-10 inset-0 bg-black/10"></div>
          </div>
        </div>

        {/* Our Traning Partner */}
      </div>

      {/* Registration Form */}
      <div className="container mx-auto px-4 py-16 bg-white rounded-lg shadow-lg mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Register for Training
        </h2>
        {sessions.length === 0 ? (
          <p className="text-center text-gray-600">
            No training sessions available at the moment.
          </p>
        ) : (
          <TrainingRegistrationForm topics={sessions} />
        )}
      </div>
    </div>
  );
}
