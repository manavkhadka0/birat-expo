import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Registration, Topic } from "@/types/training";
import { useState, useEffect } from "react";
import { registerForTraining } from "@/api/training";
import SessionCard from "./session-card";
import PaymentQR from "./payment-qr";
import { format } from "date-fns";
import {
  UserIcon,
  UsersIcon,
  TicketIcon,
  UserPlusIcon,
  CalendarIcon,
  GiftIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface Props {
  topics: Topic[];
}

interface TrainingFormData {
  time_slot: number;
  registration_type: "SINGLE" | "GROUP" | "EXPO_ACCESS";
  full_name: string;
  qualification: "Under SEE" | "10+2" | "Graduate" | "Post Graduate";
  gender: "Male" | "Female" | "Other";
  age: number;
  address: string;
  mobile_number: string;
  email: string;
  total_participants: number;
  payment_method: "Nabil_Bank";
  payment_screenshot?: File;
  agreed_to_no_refund: boolean;
}

const PRICE_CONFIG = {
  SINGLE: {
    price: 300,
    participants: 1,
    icon: UserIcon,
    description: "Individual registration for one participant",
  },
  GROUP: {
    price: 1500,
    participants: 6,
    icon: UsersIcon,
    description: "Group registration with 5 paid participants plus 1 free",
  },
  EXPO_ACCESS: {
    price: 2100,
    participants: 1,
    icon: TicketIcon,
    description: "10 days expo access with training for one participant",
  },
};

interface FileWithPreview extends File {
  preview?: string;
}

const schema = yup.object().shape({
  time_slot: yup.number().required("Please select a time slot"),
  registration_type: yup
    .string()
    .oneOf(["SINGLE", "GROUP", "EXPO_ACCESS"] as const)
    .required("Registration type is required"),
  full_name: yup.string().required("Full name is required"),
  qualification: yup
    .string()
    .oneOf(["Under SEE", "10+2", "Graduate", "Post Graduate"] as const)
    .required("Qualification is required"),
  gender: yup
    .string()
    .oneOf(["Male", "Female", "Other"] as const)
    .required("Gender is required"),
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
  payment_method: yup
    .string()
    .oneOf(["Nabil_Bank"] as const)
    .required("Payment method is required"),
  payment_screenshot: yup
    .mixed()
    .test(
      "fileRequired",
      "Payment screenshot is required",
      (value) => value instanceof File || value === undefined
    ),
  agreed_to_no_refund: yup
    .boolean()
    .oneOf([true], "You must agree to the no-refund policy"),
});

export default function TrainingRegistrationForm({ topics }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<FileWithPreview | null>(
    null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<TrainingFormData>({
    mode: "onChange",
    // @ts-ignore - Known issue with yupResolver types
    resolver: yupResolver(schema),
    defaultValues: {
      payment_method: "Nabil_Bank",
      agreed_to_no_refund: false,
      registration_type: "SINGLE",
      time_slot: 0,
      full_name: "",
      qualification: "Under SEE",
      gender: "Male",
      age: 0,
      address: "",
      mobile_number: "",
      email: "",
      total_participants: 1,
    },
  });

  const selectedTimeSlot = watch("time_slot");
  const registrationType = watch("registration_type");

  useEffect(() => {
    if (registrationType) {
      const config =
        PRICE_CONFIG[registrationType as keyof typeof PRICE_CONFIG];
      const participants = config.participants;
      setValue("total_participants", participants);
      setTotalAmount(config.price);
    }
  }, [registrationType, setValue]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileWithPreview = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });
      setUploadedFile(fileWithPreview);
      setPreviewImage(fileWithPreview.preview);
      setValue("payment_screenshot", file);
    }
  };

  const removeFile = () => {
    if (uploadedFile?.preview) {
      URL.revokeObjectURL(uploadedFile.preview);
    }
    setUploadedFile(null);
    setPreviewImage(null);
    setValue("payment_screenshot", undefined);
  };

  const onSubmit = async (data: TrainingFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const formData = new FormData();

      // Add registration_type first
      formData.append("registration_type", data.registration_type);

      // Handle file separately
      if (uploadedFile) {
        formData.append("payment_screenshot", uploadedFile);
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
          <div className="space-y-8">
            {topics.map((topic, index) => (
              <div
                key={topic.id}
                className={`space-y-4 ${
                  index !== 0 ? "pt-8 border-t-2 border-gray-100" : ""
                }`}
              >
                <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="text-3xl font-bold text-blue-600 leading-none block">
                          {(index + 1).toString().padStart(2, "0")}.
                        </span>
                        <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                          {topic.name}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {format(new Date(topic.start_date), "MMMM d, yyyy")} -{" "}
                        {format(new Date(topic.end_date), "MMMM d, yyyy")}
                      </p>
                    </div>
                    <div className="md:max-w-md md:border-l md:border-gray-200 md:pl-6">
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {topic.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {topic.time_slots.map((slot) => (
                    <SessionCard
                      key={slot.id}
                      topic={topic}
                      slot={slot}
                      isSelected={selectedTimeSlot === slot.id}
                      onSelect={(slotId) => setValue("time_slot", slotId)}
                      disabled={slot.available_spots === 0}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Registration Type */}
        <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Registration Details
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Registration Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(PRICE_CONFIG).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <label
                      key={type}
                      className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all
                        ${
                          registrationType === type
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-200 hover:bg-gray-50"
                        }
                      `}
                    >
                      <input
                        type="radio"
                        {...register("registration_type")}
                        value={type}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`p-2 rounded-lg ${
                            registrationType === type
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="font-medium text-gray-900">
                          {type.replace("_", " ")}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-2xl font-bold text-gray-900">
                          Rs. {config.price}
                        </p>
                        <p className="text-sm text-gray-600">
                          {config.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
              {errors.registration_type && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.registration_type.message}
                </p>
              )}
            </div>

            {registrationType && (
              <div className="mt-8">
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Participant Details
                </label>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                      {registrationType === "GROUP" ? (
                        <UsersIcon className="w-6 h-6" />
                      ) : (
                        <UserIcon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {
                            PRICE_CONFIG[
                              registrationType as keyof typeof PRICE_CONFIG
                            ].participants
                          }
                        </span>
                        <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          {registrationType === "GROUP"
                            ? "Participants"
                            : "Participant"}
                        </span>
                      </div>
                      {registrationType === "GROUP" && (
                        <div className="flex items-center gap-2 text-gray-600 mt-3">
                          <UserPlusIcon className="w-5 h-5" />
                          <span className="text-sm">5 paid participants</span>
                          <GiftIcon className="w-5 h-5 ml-3" />
                          <span className="text-sm">1 free participant</span>
                        </div>
                      )}
                      {registrationType === "EXPO_ACCESS" && (
                        <div className="flex items-center gap-2 text-gray-600 mt-3">
                          <CalendarIcon className="w-5 h-5" />
                          <span className="text-sm">
                            10 days expo access included
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <input type="hidden" {...register("total_participants")} />
              </div>
            )}
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
                    <label
                      className={`flex flex-col w-full ${
                        previewImage ? "h-64" : "h-32"
                      } border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-all relative`}
                    >
                      {previewImage ? (
                        <div className="relative w-full h-full">
                          <img
                            src={previewImage}
                            alt="Payment Screenshot"
                            className="w-full h-full object-contain p-2"
                          />
                          <button
                            type="button"
                            onClick={removeFile}
                            className="absolute top-2 right-2 text-gray-600 hover:text-red-500 transition-colors"
                          >
                            <XCircleIcon className="w-6 h-6" />
                          </button>
                        </div>
                      ) : (
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
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG up to 10MB
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
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
