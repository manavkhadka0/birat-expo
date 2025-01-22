"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { fetchThematicSessions, type ThematicSession } from "@/types/thematic";
import { registerForThematic } from "@/api/thematic";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDate } from "date-fns";
import { SessionModal } from "./components/session-modal";
import { ThematicRegistration } from "@/types/thematic";

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
  arrival_date: yup.string().required("Arrival date is required"),
  departure_date: yup.string().required("Departure date is required"),
  participant: yup
    .string()
    .oneOf(["Speaker", "Participant"])
    .required("Participant type is required"),
  food: yup
    .string()
    .oneOf(["Veg", "Non Veg"])
    .required("Food preference is required"),
  hotel_accomodation: yup.string().oneOf(["Self", "CIM"]).optional(),
  airline: yup.string().optional(),
  flight_no: yup.string().optional(),
  flight_time: yup.string().optional(),
  check_in_date: yup.string().optional(),
  hotel: yup.string().optional(),
});

export default function ThematicRegistrationForm() {
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<ThematicSession[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedSession = searchParams.get("session");
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
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
      hotel: "",
      flight_no: "",
      flight_time: "",
      arrival_date: new Date().toISOString(),
      departure_date: new Date().toISOString(),
      participant: "Participant",
      food: "Veg",
      hotel_accomodation: "Self",
      airline: "",
      check_in_date: new Date().toISOString(),
    },
  });

  const selectedSessions = watch("sessions") || [];

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const thematicSessions = await fetchThematicSessions();
        setSessions(thematicSessions);
      } catch (error) {
        console.error("Failed to load sessions:", error);
      }
    };
    loadSessions();
  }, []);

  useEffect(() => {
    if (preSelectedSession) {
      const sessionId = parseInt(preSelectedSession);
      const currentSessions = getValues("sessions") || [];
      if (!currentSessions.includes(sessionId)) {
        setValue("sessions", [...currentSessions, sessionId], {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    }
  }, [preSelectedSession, setValue, getValues]);

  const handleSubmitForm = async (data: {
    name: string;
    organization: string;
    designation: string;
    address: string;
    email: string;
    contact: string;
    sessions: string[];
    arrival_date: string;
    departure_date: string;
    participant: string;
    food: string;
    hotel?: string;
    hotel_accomodation?: string;
    check_in_date?: string;
    airline?: string;
    flight_no?: string;
    flight_time?: string;
  }) => {
    setLoading(true);

    const payload: ThematicRegistration = {
      name: data.name,
      organization: data.organization,
      designation: data.designation,
      address: data.address,
      email: data.email,
      contact: data.contact,
      sessions: data.sessions.map((sessionId) => parseInt(sessionId, 10)),
      arrival_date: formatDate(data.arrival_date, "yyyy-MM-dd"),
      departure_date: formatDate(data.departure_date, "yyyy-MM-dd"),
      participant: data.participant,

      food: data.food,
      hotel_accomodation: data.hotel_accomodation || "",
      ...(data.participant === "Speaker" && {
        check_in_date: formatDate(data.check_in_date || "", "yyyy-MM-dd"),
        airline: data.airline || "",
        flight_no: data.flight_no || "",
        flight_time: data.flight_time || "",
        hotel: data.hotel || "",
      }),
    };

    try {
      await registerForThematic(payload).then(() => {
        router.push("/thematic/thank-you");
      });
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-8">
        {/* Participant Selection Section */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-xl font-semibold mb-4">
            Participant Information
          </h2>
          <div className="flex space-x-4">
            <div
              onClick={() => setValue("participant", "Participant")}
              className={`flex-1 p-4 border rounded-lg cursor-pointer transition-all ${
                watch("participant") === "Participant"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300"
              }`}
            >
              <h3 className="text-lg font-semibold">Participant</h3>
              <p className="text-sm text-gray-600">
                Select this if you are a participant.
              </p>
            </div>
            <div
              onClick={() => setValue("participant", "Speaker")}
              className={`flex-1 p-4 border rounded-lg cursor-pointer transition-all ${
                watch("participant") === "Speaker"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300"
              }`}
            >
              <h3 className="text-lg font-semibold">Speaker</h3>
              <p className="text-sm text-gray-600">
                Select this if you are a speaker.
              </p>
            </div>
          </div>

          {errors.participant && (
            <p className="mt-1 text-sm text-red-600">
              {errors.participant.message}
            </p>
          )}
        </div>

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
                className="w-full p-2 border rounded-md border-gray-800 focus:border-blue-500 focus:ring-blue-500"
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
              {errors.designation && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.designation.message}
                </p>
              )}
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
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.address.message}
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
                className="w-full p-2 border rounded-md  border-gray-800 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
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
              {errors.contact && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.contact.message}
                </p>
              )}
            </div>

            {watch("participant") === "Speaker" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Food Preference
                </label>
                <select
                  {...register("food")}
                  className="w-full p-2 border rounded-md border-gray-800 focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="Veg">Veg</option>
                  <option value="Non Veg">Non Veg</option>
                </select>
                {errors.food && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.food.message}
                  </p>
                )}
              </div>
            )}

            {watch("participant") === "Speaker" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Travel Arrival Date
                </label>
                <input
                  type="date"
                  {...register("arrival_date")}
                  min={new Date().toISOString()}
                  className="w-full p-2 border rounded-md border-gray-800 focus:border-blue-500 focus:ring-blue-500"
                />

                {errors.arrival_date && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.arrival_date.message}
                  </p>
                )}
              </div>
            )}

            {watch("participant") === "Speaker" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Travel Departure Date
                </label>
                <input
                  type="date"
                  {...register("departure_date")}
                  min={new Date(
                    watch("arrival_date") || new Date()
                  ).toISOString()}
                  className="w-full p-2 border rounded-md border-gray-800 focus:border-blue-500 focus:ring-blue-500"
                />

                {errors.departure_date && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.departure_date.message}
                  </p>
                )}
              </div>
            )}
          </div>
          {watch("participant") === "Speaker" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Flight Information Section */}
              <div className="bg-white rounded-lg p-6 space-y-6">
                <h2 className="text-xl font-semibold mb-4">
                  Flight Information
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Flight Number
                  </label>
                  <input
                    type="text"
                    {...register("flight_no")}
                    className="w-full p-2 border rounded-md border-gray-800 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Flight Time
                  </label>
                  <input
                    type="time"
                    {...register("flight_time")}
                    className="w-full p-2 border rounded-md border-gray-800 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Airline
                  </label>
                  <select
                    {...register("airline")}
                    className="w-full p-2 border rounded-md border-gray-800 focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select Airline</option>
                    <option value="Yeti">Yeti</option>
                  </select>
                </div>
              </div>

              {/* Hotel Accommodation Section */}
              <div className="bg-white rounded-lg p-6 space-y-6">
                <h2 className="text-xl font-semibold mb-4">
                  Hotel Accommodation
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hotel Accommodation
                  </label>
                  <select
                    {...register("hotel_accomodation")}
                    className="w-full p-2 border rounded-md border-gray-800 focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="Self">Self</option>
                    <option value="CIM">CIM</option>
                  </select>
                  {errors.hotel_accomodation && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.hotel_accomodation.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    {...register("check_in_date")}
                    className="w-full p-2 border rounded-md border-gray-800 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.check_in_date && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.check_in_date.message}
                    </p>
                  )}
                </div>
                {watch("hotel_accomodation") === "CIM" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hotel
                    </label>
                    <select
                      {...register("hotel")}
                      className="w-full p-2 border rounded-md border-gray-800 focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select Hotel</option>
                      <option value="Ratna">Ratna</option>

                      <option value="Nepalirika">Nepalirika</option>
                      <option value="Harrison">Harrison</option>
                    </select>
                    {errors.hotel && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.hotel.message}
                      </p>
                    )}
                  </div>
                )}
                {watch("hotel_accomodation") === "Self" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enter Your Hotel Name
                    </label>
                    <input
                      type="text"
                      {...register("hotel")}
                      className="w-full p-2 border rounded-md border-gray-800 focus:border-blue-500 focus:ring-blue-500"
                    />
                    {errors.hotel && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.hotel.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Session Selection Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Select Sessions
            <span className="text-sm font-normal text-gray-500 ml-2">
              (Multiple sessions can be selected)
            </span>
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {sessions.map((session) => (
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
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedSessions.includes(session.id)}
                    onChange={() => {}}
                    className="w-6 h-6 text-blue-600 form-checkbox rounded-md"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{session.title}</h3>
                        <p className="text-sm">
                          <span className="text-blue-600 font-medium">
                            {session.date}
                          </span>
                          <span className="text-gray-500">
                            {" "}
                            | {session.start_time} - {session.end_time}
                          </span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          router.push(`/thematic/details/${session.id}`);
                        }}
                        className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                      >
                        View Details
                      </button>
                    </div>
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
