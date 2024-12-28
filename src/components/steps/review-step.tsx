import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { useState } from "react";
import { TrainingRegistrationTemplate } from "../training-registration-template";
import { format } from "date-fns";
import Image from "next/image";
import ContactCard from "../contact-card";
import { Topic } from "@/types/training";

interface ReviewStepProps {
  data: any;
  isSubmitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
  selectedTopic: Topic | null;
}

export function ReviewStep({
  data,
  selectedTopic,
  isSubmitting,
  onSubmit,
  onBack,
}: ReviewStepProps) {
  const [showPDF, setShowPDF] = useState(false);
  const [hasPDFDownloaded, setHasPDFDownloaded] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header with Logos */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <Image
            src="/logo.png"
            alt="MNIT Logo"
            width={120}
            height={60}
            className="object-contain w-32 sm:w-auto"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Live Training Registration
            </h1>
            <p className="text-sm sm:text-base text-gray-200">
              Birat Expo 2025, Rojgar Koshi
            </p>
          </div>
        </div>
        <Image
          src="/logo-2025.png"
          alt="Skill India Logo"
          width={120}
          height={60}
          className="object-contain w-32 sm:w-auto"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="col-span-1 lg:col-span-2 space-y-4 sm:space-y-6">
          {/* PDF Preview Section */}
          <section className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 gap-4">
              <h3 className="text-base sm:text-lg font-semibold">
                Registration Document
              </h3>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => setShowPDF(!showPDF)}
                  className="text-sm sm:text-base text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showPDF ? "Hide Preview" : "Show Preview"}
                </button>
                <PDFDownloadLink
                  document={
                    <TrainingRegistrationTemplate
                      data={data}
                      selectedTopic={selectedTopic}
                    />
                  }
                  fileName={`training-registration-${data.full_name}.pdf`}
                  className="text-sm sm:text-base text-blue-600 hover:text-blue-700 font-medium"
                  onClick={() => setHasPDFDownloaded(true)}
                >
                  {/* @ts-ignore */}
                  {({ loading }: { loading: boolean }) =>
                    loading ? "Generating PDF..." : "Download PDF"
                  }
                </PDFDownloadLink>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg h-[400px] sm:h-[600px]">
              <PDFViewer width="100%" height="100%" className="rounded-lg">
                <TrainingRegistrationTemplate
                  data={data}
                  selectedTopic={selectedTopic}
                />
              </PDFViewer>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="col-span-1 space-y-4 sm:space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold mb-4">
              Quick Actions
            </h3>
            <div className="space-y-4">
              {!hasPDFDownloaded && (
                <div className="text-amber-600 bg-amber-50 p-3 rounded-lg text-sm">
                  Please download the registration document before completing
                  registration
                </div>
              )}

              <button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting || !hasPDFDownloaded}
                className={`w-full px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-white font-medium text-sm sm:text-base ${
                  isSubmitting || !hasPDFDownloaded
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                title={!hasPDFDownloaded ? "Please download the PDF first" : ""}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  "Complete Registration"
                )}
              </button>

              <button
                type="button"
                onClick={onBack}
                className="w-full px-4 sm:px-6 py-2 sm:py-3 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm sm:text-base"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
