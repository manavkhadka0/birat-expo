"use client";

import GuidedTourRegistrationForm from "@/components/guided-tour/guided-tour-registration-form";
import { Suspense } from "react";

export default function GuidedTourRegistrationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">
            Guided Tour Registration
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Register your college for the Guided Exposure Tour at Birat Expo
            2025
          </p>
        </div>

        <Suspense
          fallback={
            <div className="text-center text-gray-600 min-h-0-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          }
        >
          <GuidedTourRegistrationForm />
        </Suspense>
      </div>
    </div>
  );
}
