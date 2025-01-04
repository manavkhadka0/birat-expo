"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { RSVPFormData, rsvpSchema } from "@/types/invitation";
import { motion } from "framer-motion";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { RSVPEmailTemplate } from "@/components/rsvp-email-template";

export default function InvitationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<RSVPFormData | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RSVPFormData>({
    resolver: yupResolver(rsvpSchema),
    defaultValues: {
      status: "ACCEPTED",
    },
  });

  const status = watch("status");

  const onSubmit = async (data: RSVPFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const sessionsResponse = await fetch(
        "https://yachu.baliyoventures.com/api/rsvp/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const sessionsResult = await sessionsResponse.json();

      if (!sessionsResponse.ok) {
        throw new Error("Something went wrong. Please try again later.");
      }

      // If sessions check passes, submit the RSVP
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Something went wrong. Please try again later.");
      }

      setSubmittedData(data);
      setSuccess(true);
    } catch (err) {
      const errorMessage = "Something went wrong. Please try again later.";
      setError(errorMessage);
      console.error("RSVP submission error:", err);

      // Scroll to error message
      const errorElement = document.querySelector(".error-message");
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success && submittedData) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Thank you for your response!
          </h2>
          <p className="text-gray-600">
            Your RSVP has been successfully recorded.
          </p>
        </div>

        <div className="mt-6 text-center space-y-4">
          <PDFDownloadLink
            document={<RSVPEmailTemplate data={submittedData} />}
            fileName="rsvp-confirmation.pdf"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {/* @ts-ignore */}
            {({ loading }) =>
              loading ? "Generating PDF..." : "Download Confirmation"
            }
          </PDFDownloadLink>

          <div>
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-indigo-600 bg-white border-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Return to Homepage
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold text-center mb-8">RSVP Form</h1>

      {error && (
        <div className="error-message mb-4 p-4 bg-red-50 border border-red-400 rounded text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Name *
          </label>
          <input
            type="text"
            {...register("name")}
            className="mt-1 block w-full p-2 border rounded-sm border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="designation"
            className="block text-sm  font-medium text-gray-700"
          >
            Designation *
          </label>
          <input
            type="text"
            {...register("designation")}
            className="mt-1 block w-full p-2 border rounded-sm border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.designation && (
            <p className="mt-1 text-sm text-red-600">
              {errors.designation.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="company_name"
            className="block text-sm font-medium text-gray-700"
          >
            Company Name *
          </label>
          <input
            type="text"
            {...register("company_name")}
            className="mt-1 block w-full p-2 border rounded-sm border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.company_name && (
            <p className="mt-1 text-sm text-red-600">
              {errors.company_name.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="phone_number"
            className="block text-sm font-medium text-gray-700"
          >
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            {...register("phone_number")}
            className="mt-1 block w-full p-2 border rounded-sm border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.phone_number && (
            <p className="mt-1 text-sm text-red-600">
              {errors.phone_number.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email (Optional)
          </label>
          <input
            type="email"
            {...register("email")}
            className="mt-1 block w-full p-2 border rounded-sm border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Response *
          </label>
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                {...register("status")}
                value="ACCEPTED"
                className="form-radio text-indigo-600 h-5 w-5"
              />
              <span className="ml-2">Accept</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                {...register("status")}
                value="REJECTED"
                className="form-radio text-indigo-600 h-5 w-5"
              />
              <span className="ml-2">Decline</span>
            </label>
          </div>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        {status === "REJECTED" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <label
              htmlFor="remarks"
              className="block text-sm font-medium text-gray-700"
            >
              Remarks *
            </label>
            <textarea
              {...register("remarks")}
              rows={4}
              className="mt-1 block w-full p-2 border rounded-sm border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Please provide a reason for declining..."
            />
            {errors.remarks && (
              <p className="mt-1 text-sm text-red-600">
                {errors.remarks.message}
              </p>
            )}
          </motion.div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Response"}
          </button>
        </div>
      </form>
    </div>
  );
}
