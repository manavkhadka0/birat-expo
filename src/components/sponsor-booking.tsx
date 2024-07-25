"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

const schema = yup.object().shape({
  companyName: yup.string().required("Company Name is required"),
  companyEmail: yup
    .string()
    .email("Invalid email")
    .required("Email is required"),
  contactNumber: yup.string().required("Contact Number is required"),
});

const SponsorBookingForm = () => {
  const searchParams = useSearchParams();
  const stallType = searchParams.get("sponsor_type") || "";
  const stallId = searchParams.get("stall_id") || "";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const route = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await axios.post("/api/sponsor-booking", {
        stallType,
        stallId,
        ...data,
      });
      setSuccess("Booking confirmation sent successfully!");
      route.push("/thank-you");
    } catch (error) {
      console.error(error);
      setError(
        "An error occurred while submitting the form. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-100 p-6 pb-40 pt-20">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-lg bg-white shadow-md">
        <div className="bg-blue-800 p-6 text-center text-white">
          <h1 className="text-3xl font-bold">BIRAT EXPO-2024 Stall Booking</h1>
          <p className="mt-2 text-xl">Confirm Your Stall Reservation</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {error && (
            <div className="mb-6 text-center">
              <p className="text-red-500">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 text-center">
              <p className="text-green-500">{success}</p>
              <p className="text-green-800">Check your Mail</p>
            </div>
          )}

          <div className="mb-4">
            <label className="mb-1 block">Stall Type:</label>
            <input
              type="text"
              value={stallType}
              disabled
              className="w-full rounded border p-2 bg-gray-100"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block">Stall ID:</label>
            <input
              type="text"
              value={stallId}
              disabled
              className="w-full rounded border p-2 bg-gray-100"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block">Company Name:</label>
            <input
              {...register("companyName")}
              type="text"
              className="w-full rounded border p-2"
            />
            {errors.companyName && (
              <p className="text-red-500 text-sm">
                {errors.companyName.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="mb-1 block">Company Email:</label>
            <input
              {...register("companyEmail")}
              type="email"
              className="w-full rounded border p-2"
            />
            {errors.companyEmail && (
              <p className="text-red-500 text-sm">
                {errors.companyEmail.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="mb-1 block">Contact Number:</label>
            <input
              {...register("contactNumber")}
              type="tel"
              className="w-full rounded border p-2"
            />
            {errors.contactNumber && (
              <p className="text-red-500 text-sm">
                {errors.contactNumber.message}
              </p>
            )}
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`rounded px-6 py-2 text-white ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  Submitting...
                </>
              ) : (
                "Confirm Booking"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SponsorBookingForm;
