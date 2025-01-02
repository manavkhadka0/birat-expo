"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  TOUR_DATES,
  guidedTourSchema,
  type GuidedTourFormData,
} from "@/types/guided-tour";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { registerForGuidedTour } from "@/api/guided-tour";

export default function GuidedTourRegistrationForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedDate = searchParams.get("date");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<GuidedTourFormData>({
    resolver: yupResolver(guidedTourSchema),
    defaultValues: {
      collegeName: "",
      district: "",
      municipality: "",
      ward: "",
      phone: "",
      email: "",
      contactPersonName: "",
      designation: "",
      mobileNo: "",
      tourDate: preselectedDate || "",
      numberOfStudents: undefined,
      studentLevel: undefined,
    },
  });

  useEffect(() => {
    if (preselectedDate) {
      setValue("tourDate", preselectedDate);
    }
  }, [preselectedDate, setValue]);

  const onSubmit = async (data: GuidedTourFormData) => {
    setLoading(true);
    try {
      await registerForGuidedTour(data);
      router.push("/thank-you");
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <h2 className="text-xl font-semibold mb-4">College Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              College Name
            </label>
            <input
              type="text"
              {...register("collegeName")}
              className="w-full p-2 border rounded-md border-gray-800 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.collegeName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.collegeName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              District
            </label>
            <input
              type="text"
              {...register("district")}
              className="w-full p-2 border rounded-md border-gray-800 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.district && (
              <p className="mt-1 text-sm text-red-600">
                {errors.district.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Municipality
            </label>
            <input
              type="text"
              {...register("municipality")}
              className="w-full p-2 border rounded-md border-gray-800 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.municipality && (
              <p className="mt-1 text-sm text-red-600">
                {errors.municipality.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ward
            </label>
            <input
              type="text"
              {...register("ward")}
              className="w-full p-2 border rounded-md border-gray-800 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.ward && (
              <p className="mt-1 text-sm text-red-600">{errors.ward.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              {...register("phone")}
              className="w-full p-2 border rounded-md border-gray-800 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              {...register("email")}
              className="w-full p-2 border rounded-md border-gray-800 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Person Name
            </label>
            <input
              type="text"
              {...register("contactPersonName")}
              className="w-full p-2 border rounded-md border-gray-800 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.contactPersonName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.contactPersonName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Designation
            </label>
            <input
              type="text"
              {...register("designation")}
              className="w-full p-2 border rounded-md border-gray-800 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.designation && (
              <p className="mt-1 text-sm text-red-600">
                {errors.designation.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              {...register("mobileNo")}
              className="w-full p-2 border rounded-md border-gray-800 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.mobileNo && (
              <p className="mt-1 text-sm text-red-600">
                {errors.mobileNo.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tour Date
            </label>
            <select
              {...register("tourDate")}
              className="w-full p-2 border rounded-md border-gray-800 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a date</option>
              {TOUR_DATES.map((date) => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString()}
                </option>
              ))}
            </select>
            {errors.tourDate && (
              <p className="mt-1 text-sm text-red-600">
                {errors.tourDate.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Students
            </label>
            <input
              type="number"
              {...register("numberOfStudents", { valueAsNumber: true })}
              min={1}
              max={50}
              className="w-full p-2 border rounded-md border-gray-800 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.numberOfStudents && (
              <p className="mt-1 text-sm text-red-600">
                {errors.numberOfStudents.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student Level
            </label>
            <select
              {...register("studentLevel")}
              className="w-full p-2 border rounded-md border-gray-800 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select student level</option>
              <option value="10+2">10+2</option>
              <option value="Bachelors">Bachelors</option>
              <option value="Masters">Masters</option>
              <option value="Mixed">Mixed</option>
            </select>
            {errors.studentLevel && (
              <p className="mt-1 text-sm text-red-600">
                {errors.studentLevel.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Submitting..." : "Register"}
      </button>
    </form>
  );
}
