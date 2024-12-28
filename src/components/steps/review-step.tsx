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
    <div className="max-w-7xl mx-auto">
      {/* Header with Logos */}
      <div className="flex items-center justify-between mb-8 p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm">
        <div className="flex items-center gap-6">
          <Image
            src="/logo.png"
            alt="MNIT Logo"
            width={180}
            height={80}
            className="object-contain"
          />
          <div className="">
            <h1 className="text-2xl font-bold text-white">
              Live Training Registration
            </h1>
            <p className="text-gray-200">Birat Expo 2025, Rojgar Koshi</p>
          </div>
        </div>
        <Image
          src="/logo-2025.png"
          alt="Skill India Logo"
          width={180}
          height={60}
          className="object-contain"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content - Takes 2 columns */}
        <div className="col-span-2 space-y-6">
          <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Review Registration
            </h2>

            {/* Session Details with enhanced UI */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Session Details
              </h3>
              <div className="bg-gray-50 p-6 rounded-lg space-y-3 border border-gray-200">
                <p className="flex items-center gap-2">
                  <span className="font-medium min-w-32">Topic:</span>
                  <span className="text-gray-700">{selectedTopic?.name}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium min-w-32">Description:</span>
                  <span className="text-gray-700">
                    {selectedTopic?.description}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium min-w-32">Date:</span>
                  <span className="text-gray-700">
                    {format(new Date(data.date), "PPP")}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium min-w-32">Time Slot:</span>
                  <span className="text-gray-700">
                    {
                      selectedTopic?.time_slots.find(
                        (slot) => slot.id === data.time_slot
                      )?.start_time
                    }{" "}
                    -{" "}
                    {
                      selectedTopic?.time_slots.find(
                        (slot) => slot.id === data.time_slot
                      )?.end_time
                    }
                  </span>
                </p>
              </div>
            </div>

            {/* Registration Details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">
                Registration Information
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p>
                  <span className="font-medium">Registration Type:</span>{" "}
                  {data.registration_type}
                </p>
                <p>
                  <span className="font-medium">Full Name:</span>{" "}
                  {data.full_name}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {data.email}
                </p>
                <p>
                  <span className="font-medium">Mobile:</span>{" "}
                  {data.mobile_number}
                </p>
                <p>
                  <span className="font-medium">Qualification:</span>{" "}
                  {data.qualification}
                </p>
                {/* Add other personal details */}
              </div>
            </div>

            {/* Group Members (if applicable) */}
            {data.registration_type === "Group" && data.group_members && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Group Members</h3>
                <div className="space-y-4">
                  {data.group_members.map((member: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium mb-2">Member {index + 1}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <p>
                          <span className="font-medium">Name:</span>{" "}
                          {member.name}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span>{" "}
                          {member.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p>
                  <span className="font-medium">Payment Method:</span>{" "}
                  {data.payment_method}
                </p>
                {data.payment_screenshot && (
                  <div>
                    <p className="font-medium mb-2">Payment Screenshot:</p>
                    <img
                      src={URL.createObjectURL(data.payment_screenshot)}
                      alt="Payment Screenshot"
                      className="max-h-48 rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* PDF Preview Section */}
          <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Registration Document</h3>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowPDF(!showPDF)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
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
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  onClick={() => setHasPDFDownloaded(true)}
                >
                  {/* @ts-ignore */}
                  {({ loading }: { loading: boolean }) =>
                    loading ? "Generating PDF..." : "Download PDF"
                  }
                </PDFDownloadLink>
              </div>
            </div>

            {showPDF && (
              <div className="border border-gray-200 rounded-lg h-[600px]">
                <PDFViewer width="100%" height="100%" className="rounded-lg">
                  <TrainingRegistrationTemplate
                    data={data}
                    selectedTopic={selectedTopic}
                  />
                </PDFViewer>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar - Takes 1 column */}
        <div className="space-y-6">
          {/* Contact Card */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-4">
              {!hasPDFDownloaded && (
                <div className="text-amber-600 bg-amber-50 p-3 rounded-lg text-sm mb-4">
                  Please download the registration document before completing
                  registration
                </div>
              )}
              <div className="flex gap-4">
                <PDFDownloadLink
                  document={
                    <TrainingRegistrationTemplate
                      data={data}
                      selectedTopic={selectedTopic}
                    />
                  }
                  fileName={`training-registration-${data.full_name}.pdf`}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  onClick={() => setHasPDFDownloaded(true)}
                >
                  {/* @ts-ignore */}
                  {({ loading }: { loading: boolean }) =>
                    loading ? "Generating PDF..." : "Download PDF"
                  }
                </PDFDownloadLink>
              </div>

              <button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting || !hasPDFDownloaded}
                className={`w-full px-6 py-3 rounded-lg text-white font-medium ${
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
                className="w-full px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Back
              </button>
            </div>
          </div>

          {/* Quick Actions */}
        </div>
      </div>
    </div>
  );
}
