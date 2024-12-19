import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { useState } from "react";
import { TrainingRegistrationTemplate } from "../training-registration-template";
import { format } from "date-fns";

interface ReviewStepProps {
  data: any;
  isSubmitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

export function ReviewStep({
  data,
  isSubmitting,
  onSubmit,
  onBack,
}: ReviewStepProps) {
  const [showPDF, setShowPDF] = useState(false);

  return (
    <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Review Registration
      </h2>

      {/* Session Details */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Session Details</h3>
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <p>
            <span className="font-medium">Date:</span>{" "}
            {format(new Date(data.date), "PPP")}
          </p>
          <p>
            <span className="font-medium">Time Slot:</span> {data.time_slot}
          </p>
        </div>
      </div>

      {/* Registration Details */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Registration Information</h3>
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <p>
            <span className="font-medium">Registration Type:</span>{" "}
            {data.registration_type}
          </p>
          <p>
            <span className="font-medium">Full Name:</span> {data.full_name}
          </p>
          <p>
            <span className="font-medium">Email:</span> {data.email}
          </p>
          <p>
            <span className="font-medium">Mobile:</span> {data.mobile_number}
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
                    <span className="font-medium">Name:</span> {member.name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {member.email}
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

      {/* PDF Preview */}
      <div className="mb-8">
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
              document={<TrainingRegistrationTemplate data={data} />}
              fileName={`training-registration-${data.full_name}.pdf`}
              className="text-blue-600 hover:text-blue-700 font-medium"
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
              <TrainingRegistrationTemplate data={data} />
            </PDFViewer>
          </div>
        )}
      </div>

      {/* Navigation and Submit */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className={`px-6 py-2 rounded-lg text-white ${
            isSubmitting
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
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
      </div>
    </section>
  );
}
