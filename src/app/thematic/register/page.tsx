import ThematicRegistrationForm from "@/components/thematic/thematic-registration-form";
import { Loader2Icon } from "lucide-react";
import { Suspense } from "react";

export default function ThematicRegistrationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">
            Thematic Session Registration
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Register for the Thematic Sessions at Birat Expo 2025
          </p>
        </div>

        <Suspense
          fallback={
            <div className="text-center text-gray-500 min-h-screen flex items-center justify-center">
              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center gap-2">
                  <Loader2Icon className="w-6 h-6 animate-spin" />
                </div>
              </div>
            </div>
          }
        >
          <ThematicRegistrationForm />
        </Suspense>
      </div>
    </div>
  );
}
