import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Registration, Topic } from "@/types/training";
import { useState, useEffect } from "react";
import { registerForTraining } from "@/api/training";
import SessionCard from "./session-card";
import PaymentQR from "./payment-qr";

const schema = yup.object().shape({
  time_slot: yup.number().required("Please select a time slot"),
  registration_type: yup.string().required("Registration type is required"),
  full_name: yup.string().required("Full name is required"),
  qualification: yup.string().required("Qualification is required"),
  gender: yup.string().required("Gender is required"),
  age: yup
    .number()
    .min(14, "Must be at least 14 years old")
    .required("Age is required"),
  address: yup.string().required("Address is required"),
  mobile_number: yup
    .string()
    .matches(/^\+?1?\d{9,15}$/, "Invalid phone number")
    .required("Mobile number is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  total_participants: yup
    .number()
    .min(1)
    .required("Number of participants is required"),
  payment_method: yup.string().required("Payment method is required"),
  payment_screenshot: yup.mixed().required("Payment screenshot is required"),
  agreed_to_no_refund: yup
    .boolean()
    .oneOf([true], "You must agree to the no-refund policy"),
});

interface Props {
  topics: Topic[];
}

const PRICE_CONFIG = {
  SINGLE: 300,
  GROUP: 1500,
  EXPO_ACCESS: 2100,
};

export default function TrainingRegistrationForm({ topics }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<Registration>({
    resolver: yupResolver(schema),
  });

  const selectedTimeSlot = watch("time_slot");
  const registrationType = watch("registration_type");
  const totalParticipants = watch("total_participants");

  // Calculate total amount when registration type or participants change
  useEffect(() => {
    if (registrationType) {
      const basePrice =
        PRICE_CONFIG[registrationType as keyof typeof PRICE_CONFIG];
      setTotalAmount(basePrice * (totalParticipants || 1));
    }
  }, [registrationType, totalParticipants]);

  const onSubmit = async (data: Registration) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const formData = new FormData();

      // Add registration_type first
      formData.append("registration_type", data.registration_type);

      // Handle file separately
      if (data.payment_screenshot instanceof FileList) {
        formData.append("payment_screenshot", data.payment_screenshot[0]);
      }

      // Add all other fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "payment_screenshot" && value !== undefined) {
          formData.append(key, String(value));
        }
      });

      const response = await registerForTraining(formData);

      if (response.id) {
        // Check if we got a successful response with an ID
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        throw new Error("Registration failed. Please try again.");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to register. Please try again.";
      setError(errorMessage);
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Log error for debugging
      console.error("Registration error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-8 rounded text-center">
        <svg
          className="w-16 h-16 text-green-500 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <h2 className="text-2xl font-semibold mb-2">
          Registration Successful!
        </h2>
        <p>
          Thank you for registering. You will receive a confirmation email
          shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-sm mb-8">
          <div className="flex items-center">
            <svg
              className="w-6 h-6 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-bold">Registration Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Session Selection */}
        <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Select Training Session
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topics.map((topic) =>
              topic.time_slots.map((slot) => (
                <SessionCard
                  key={slot.id}
                  topic={topic}
                  slot={slot}
                  isSelected={selectedTimeSlot === slot.id}
                  onSelect={(slotId) => setValue("time_slot", slotId)}
                  disabled={slot.available_spots === 0}
                />
              ))
            )}
          </div>
        </section>

        {/* Registration Type */}
        <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Registration Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Registration Type
              </label>
              <select
                {...register("registration_type")}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select type</option>
                <option value="SINGLE">Single Person (Rs. 300)</option>
                <option value="GROUP">Group (Rs. 1500)</option>
                <option value="EXPO_ACCESS">Expo Access (Rs. 2100)</option>
              </select>
              {errors.registration_type && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.registration_type.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Number of Participants
              </label>
              <input
                type="number"
                min="1"
                {...register("total_participants", {
                  setValueAs: (value) => parseInt(value, 10),
                })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {errors.total_participants && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.total_participants.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Personal Information */}
        <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                {...register("full_name")}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your full name"
              />
              {errors.full_name && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Qualification
              </label>
              <select
                {...register("qualification")}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select qualification</option>
                <option value="Under SEE">Under SEE</option>
                <option value="10+2">10+2</option>
                <option value="Graduate">Graduate</option>
                <option value="Post Graduate">Post Graduate</option>
              </select>
              {errors.qualification && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.qualification.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gender
              </label>
              <select
                {...register("gender")}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.gender.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Age
              </label>
              <input
                type="number"
                min="14"
                {...register("age", {
                  setValueAs: (value) => parseInt(value, 10),
                })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {errors.age && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.age.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                {...register("address")}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your full address"
              />
              {errors.address && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                {...register("mobile_number")}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="+977XXXXXXXXXX"
              />
              {errors.mobile_number && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.mobile_number.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                {...register("email")}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="your.email@example.com"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Payment Section */}
        {registrationType && (
          <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Payment Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <PaymentQR amount={totalAmount} />

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    {...register("payment_method")}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select payment method</option>
                    <option value="Nabil_Bank">Nabil Bank</option>
                  </select>
                  {errors.payment_method && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.payment_method.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Screenshot
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-8 h-8 mb-4 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG up to 10MB
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        {...register("payment_screenshot")}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {errors.payment_screenshot && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.payment_screenshot.message}
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      {...register("agreed_to_no_refund")}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      I understand and agree to the no-refund policy
                    </span>
                  </label>
                  {errors.agreed_to_no_refund && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.agreed_to_no_refund.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
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
              Processing Registration...
            </div>
          ) : (
            "Complete Registration"
          )}
        </button>
      </form>
    </div>
  );
}
