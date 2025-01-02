import ThematicRegistrationForm from "@/components/thematic/thematic-registration-form";

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

        <ThematicRegistrationForm />
      </div>
    </div>
  );
}
