"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { THEMATIC_SESSIONS } from "@/types/thematic";
import { registerForThematic } from "@/api/thematic";
import { useRouter } from "next/navigation";
const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  organization: yup.string().required("Organization is required"),
  designation: yup.string().required("Designation is required"),
  address: yup.string().required("Address is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  contact: yup
    .string()
    .matches(/^\+?1?\d{9,15}$/, "Invalid phone number")
    .required("Contact number is required"),
  sessions: yup
    .array()
    .min(1, "Please select at least one session")
    .required("Please select at least one session"),
});

export default function ThematicRegistrationForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      organization: "",
      designation: "",
      address: "",
      email: "",
      contact: "",
      sessions: [],
    },
  });

  const selectedSessions = watch("sessions") || [];

  const handleSubmitForm = async (data: {
    name: string;
    organization: string;
    designation: string;
    address: string;
    email: string;
    contact: string;
    sessions: string[];
  }) => {
    setLoading(true);

    const payload = {
      ...data,
      sessions: THEMATIC_SESSIONS.filter((session) =>
        selectedSessions.includes(session.id)
      ),
    };

    try {
      await registerForThematic(payload);
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setLoading(false);
      router.push("/thank-you");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-8">
        {/* Personal Information Section */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                {...register("name")}
                className="w-full p-2 border rounded-md  border-gray-800 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization
              </label>
              <input
                type="text"
                {...register("organization")}
                className="w-full p-2 border rounded-md  border-gray-800 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.organization && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.organization.message}
                </p>
              )}
            </div>

            {/* Add other form fields similarly */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation
              </label>
              <input
                type="text"
                {...register("designation")}
                className="w-full p-2 border rounded-md  border-gray-800 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                {...register("address")}
                className="w-full p-2 border rounded-md  border-gray-800 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                {...register("email")}
                className="w-full p-2 border rounded-md  border-gray-800 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact
              </label>
              <input
                type="text"
                {...register("contact")}
                className="w-full p-2 border rounded-md  border-gray-800 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Session Selection Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Select Sessions
            <span className="text-sm font-normal text-gray-500 ml-2">
              (Multiple sessions can be selected)
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {THEMATIC_SESSIONS.map((session) => (
              <div
                key={session.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedSessions.includes(session.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
                onClick={() => {
                  const newSessions = selectedSessions.includes(session.id)
                    ? selectedSessions.filter((id) => id !== session.id)
                    : [...selectedSessions, session.id];
                  setValue("sessions", newSessions, { shouldValidate: true });
                }}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedSessions.includes(session.id)}
                    onChange={() => {}}
                    className="mt-1"
                  />
                  <div>
                    <h3 className="font-medium">{session.title}</h3>
                    <p className="text-sm text-gray-500">
                      {session.date} | {session.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {errors.sessions && (
            <p className="mt-2 text-sm text-red-600">
              {errors.sessions.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Submitting..." : "Register"}
        </button>
      </form>
    </div>
  );
}
