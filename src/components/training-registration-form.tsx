import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Topic } from "@/types/training";
import { useState, useEffect } from "react";
import { registerForTraining } from "@/api/training";
import { eachDayOfInterval } from "date-fns";
import { UserIcon, UsersIcon, TicketIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { CheckIcon } from "@heroicons/react/24/solid";
import { SessionSelectionStep } from "./steps/session-selection-step";
import { RegistrationDetailsStep } from "./steps/registration-details-step";
import { PaymentStep } from "./steps/payment-step";
import { ReviewStep } from "./steps/review-step";
import { PRICE_CONFIG } from "@/lib/constants";

interface Props {
  topics: Topic[];
}

interface GroupMember {
  name: string;
  email: string;
  mobile_number: string;
  address: string;
  qualification: "Under SEE" | "10+2" | "Graduate" | "Post Graduate";
  gender: "Male" | "Female" | "Other";
  age: number;
}

interface TrainingFormData {
  time_slot: number;
  date: string;
  registration_type: "Single Person" | "Group" | "Expo Access";
  full_name: string;
  qualification: "Under SEE" | "10+2" | "Graduate" | "Post Graduate";
  gender: "Male" | "Female" | "Other";
  age: number;
  address: string;
  mobile_number: string;
  email: string;
  total_participants: number;
  payment_method: "Nabil Bank";
  payment_screenshot?: File;
  agreed_to_no_refund: boolean;
  group_members?: GroupMember[];
}

interface FileWithPreview extends File {
  preview?: string;
}

const schema = yup.object().shape({
  time_slot: yup.number().required("Please select a time slot"),
  date: yup.string().required("Please select a date"),
  registration_type: yup
    .string()
    .oneOf(["Single Person", "Group", "Expo Access"] as const)
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
    .min(10, "Must be at least 10 years old")
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
    .oneOf(["Nabil Bank"] as const)
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
  group_members: yup.array().when("registration_type", {
    is: "Group",
    then: (schema) =>
      schema.of(
        yup.object().shape({
          name: yup.string().required("Name is required"),
          email: yup
            .string()
            .email("Invalid email")
            .required("Email is required"),
          mobile_number: yup
            .string()
            .matches(/^\+?1?\d{9,15}$/, "Invalid phone number")
            .required("Mobile number is required"),
          address: yup.string().required("Address is required"),
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
            .min(10, "Must be at least 10 years old")
            .required("Age is required"),
        })
      ),
    otherwise: (schema) => schema.notRequired(),
  }),
});

type Step = {
  id: number;
  name: string;
  description: string;
  status: "upcoming" | "current" | "complete";
};

export default function TrainingRegistrationForm({ topics }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<FileWithPreview | null>(
    null
  );
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<TrainingFormData>>({});
  const [steps, setSteps] = useState<Step[]>([
    {
      id: 1,
      name: "Session Selection",
      description: "Select Event you want to attend",
      status: "current",
    },
    {
      id: 2,
      name: "Registration Details",
      description: "Register your Personal Data",
      status: "upcoming",
    },
    {
      id: 3,
      name: "Payment",
      description: "Pay for the session digitally",
      status: "upcoming",
    },
    {
      id: 4,
      name: "Review",
      description: "Review your details and share/export if needed",
      status: "upcoming",
    },
  ]);

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
      payment_method: "Nabil Bank",
      agreed_to_no_refund: false,
      registration_type: "Single Person",
      time_slot: 0,
      full_name: "",
      qualification: "Under SEE",
      gender: "Male",
      age: 10,
      address: "",
      mobile_number: "",
      email: "",
      total_participants: 1,
      group_members: [],
    },
  });

  const registrationType = watch("registration_type");

  useEffect(() => {
    if (registrationType) {
      const config =
        PRICE_CONFIG[registrationType as keyof typeof PRICE_CONFIG];
      const participants = config.participants;
      setValue("total_participants", participants);
      setTotalAmount(config.price);

      if (registrationType === "Group") {
        setValue("group_members", Array(5).fill({ name: "", email: "" }));
      } else {
        setValue("group_members", []);
      }
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

      // Handle file separately
      if (uploadedFile) {
        formData.append("payment_screenshot", uploadedFile);
      }

      // Add all other fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === "group_members" && value) {
          formData.append(key, JSON.stringify(value));
        } else if (key !== "payment_screenshot" && value !== undefined) {
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

  const handleNextStep = async (data: Partial<TrainingFormData>) => {
    // Define validation schemas for each step
    const stepValidationSchemas = {
      1: yup.object().shape({
        time_slot: yup.number().required("Please select a time slot"),
        date: yup.string().required("Please select a date"),
      }),
      2: yup.object().shape({
        registration_type: yup
          .string()
          .oneOf(["Single Person", "Group", "Expo Access"] as const)
          .required("Registration type is required"),
        full_name: yup.string().required("Full name is required"),
        email: yup
          .string()
          .email("Invalid email")
          .required("Email is required"),
        mobile_number: yup
          .string()
          .matches(/^\+?1?\d{9,15}$/, "Invalid phone number")
          .required("Mobile number is required"),
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
          .min(10, "Must be at least 10 years old")
          .required("Age is required"),
        address: yup.string().required("Address is required"),
        group_members: yup.array().when("registration_type", {
          is: "Group",
          then: (schema) =>
            schema.of(
              yup.object().shape({
                name: yup.string().required("Name is required"),
                email: yup
                  .string()
                  .email("Invalid email")
                  .required("Email is required"),
                mobile_number: yup
                  .string()
                  .matches(/^\+?1?\d{9,15}$/, "Invalid phone number")
                  .required("Mobile number is required"),
                address: yup.string().required("Address is required"),
                qualification: yup
                  .string()
                  .oneOf([
                    "Under SEE",
                    "10+2",
                    "Graduate",
                    "Post Graduate",
                  ] as const)
                  .required("Qualification is required"),
                gender: yup
                  .string()
                  .oneOf(["Male", "Female", "Other"] as const)
                  .required("Gender is required"),
                age: yup
                  .number()
                  .min(10, "Must be at least 10 years old")
                  .required("Age is required"),
              })
            ),
        }),
      }),
      3: yup.object().shape({
        payment_method: yup
          .string()
          .oneOf(["Nabil Bank"] as const)
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
      }),
    };

    try {
      // Merge existing form data with new data
      const updatedData = { ...formData, ...data };
      setFormData(updatedData);

      // If it's the final step, submit the form
      if (currentStep === 4) {
        const event = { preventDefault: () => {}, ...updatedData };
        await handleSubmit(onSubmit)(event as any);
        return;
      }

      // Validate current step
      await stepValidationSchemas[
        currentStep as keyof typeof stepValidationSchemas
      ].validate(updatedData, { abortEarly: false });

      // If validation passes, update steps and move to next step
      setSteps((prevSteps) =>
        prevSteps.map((step) => ({
          ...step,
          status:
            step.id === currentStep
              ? "complete"
              : step.id === currentStep + 1
              ? "current"
              : step.status,
        }))
      );

      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        // Handle validation errors
        const validationErrors: { [key: string]: string } = {};
        err.inner.forEach((error) => {
          if (error.path) {
            validationErrors[error.path] = error.message;
          }
        });

        // Set errors in the form
        Object.keys(validationErrors).forEach((key) => {
          setValue(key as any, (formData as any)[key], {
            shouldValidate: true,
            shouldDirty: true,
          });
        });
      } else {
        console.error("Validation error:", err);
        setError("Please fill in all required fields correctly.");
      }
    }
  };

  const handlePreviousStep = () => {
    // Update steps status
    setSteps((prevSteps) =>
      prevSteps.map((step) => ({
        ...step,
        status:
          step.id === currentStep
            ? "upcoming"
            : step.id === currentStep - 1
            ? "current"
            : step.status,
      }))
    );

    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const StepProgress = ({ steps }: { steps: Step[] }) => (
    <div className="py-12 px-4">
      <h1 className="text-3xl font-semibold text-center text-[#4F46E5] mb-12">
        Register for the Session
      </h1>
      <nav aria-label="Progress" className="max-w-4xl mx-auto">
        <ol className="flex items-center justify-between">
          {/* Steps with connectors */}
          {steps.map((step, index) => (
            <li key={step.id} className="flex items-center flex-1">
              {/* Step circle and content */}
              <div className="flex flex-col items-center flex-1">
                {/* Step circle */}
                <div className="mb-4 relative flex items-center">
                  {/* Connector line before the circle (except first step) */}
                  {index !== 0 && (
                    <div
                      className={`h-[2px] w-full absolute right-full mr-4 ${
                        steps[index - 1].status === "complete"
                          ? "bg-[#4F46E5]"
                          : "bg-gray-200"
                      }`}
                      style={{ width: "100%" }}
                    />
                  )}

                  {/* Circle with content */}
                  {step.status === "complete" ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="h-10 w-10 rounded-full bg-[#4F46E5] flex items-center justify-center"
                    >
                      <CheckIcon className="w-6 h-6 text-white" />
                    </motion.div>
                  ) : step.status === "current" ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="h-10 w-10 rounded-full bg-[#4F46E5] flex items-center justify-center"
                    >
                      <span className="text-white font-medium">
                        {String(step.id).padStart(2, "0")}
                      </span>
                    </motion.div>
                  ) : (
                    <div className="h-10 w-10 rounded-full border-2 border-gray-200 flex items-center justify-center bg-white">
                      <span className="text-gray-500 font-medium">
                        {String(step.id).padStart(2, "0")}
                      </span>
                    </div>
                  )}

                  {/* Connector line after the circle (except last step) */}
                  {index !== steps.length - 1 && (
                    <div
                      className={`h-[2px] w-full absolute left-full ml-4 ${
                        step.status === "complete"
                          ? "bg-[#4F46E5]"
                          : "bg-gray-200"
                      }`}
                      style={{ width: "100%" }}
                    />
                  )}
                </div>

                {/* Labels */}
                <div className="flex flex-col items-center text-center">
                  <span
                    className={`text-sm font-medium ${
                      step.status === "current"
                        ? "text-[#4F46E5]"
                        : "text-gray-500"
                    }`}
                  >
                    {step.name}
                  </span>
                  <span
                    className={`text-xs mt-1 max-w-[180px] ${
                      step.status === "current"
                        ? "text-gray-600"
                        : "text-gray-400"
                    }`}
                  >
                    {step.description}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );

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
      <StepProgress steps={steps} />

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

      <form className="space-y-8">
        {currentStep === 1 && (
          <SessionSelectionStep
            topics={topics}
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            selectedTopic={selectedTopic}
            setSelectedTopic={setSelectedTopic}
            onNext={handleNextStep}
          />
        )}

        {currentStep === 2 && (
          <RegistrationDetailsStep
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        )}

        {currentStep === 3 && (
          <PaymentStep
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            totalAmount={totalAmount}
            handleFileUpload={handleFileUpload}
            removeFile={removeFile}
            previewImage={previewImage}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        )}

        {currentStep === 4 && (
          <ReviewStep
            data={formData}
            selectedTopic={selectedTopic}
            isSubmitting={isSubmitting}
            onSubmit={() => handleNextStep(formData)}
            onBack={handlePreviousStep}
          />
        )}
      </form>
    </div>
  );
}
