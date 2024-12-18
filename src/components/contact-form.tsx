import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { motion } from "framer-motion";
import { User, Mail, Phone, MessageSquare } from "lucide-react";
import SuccessModal from "./success-modal";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup
    .string()
    .matches(/^[0-9]+$/, "Must be only digits")
    .min(10, "Must be at least 10 digits")
    .required("Phone number is required"),
  message: yup.string().required("Message is required"),
});

const ContactForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await axios.post("/api/send", data);
      setShowSuccessModal(true);
      reset(); // Reset form after successful submission
    } catch (error) {
      console.error(error);
      // You might want to add error handling here
    } finally {
      setIsSubmitting(false);
    }
  };

  const InputWrapper = ({ children }: { children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative border border-gray-200 rounded-lg"
    >
      {children}
    </motion.div>
  );

  return (
    <>
      <div className="lg:p-8">
        <div className="w-full container mx-auto p-8 flex flex-col items-center justify-center md:flex-row gap-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="lg:w-2/3 space-y-6 mb-20"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-3xl font-extrabold text-gray-800 mb-10 text-center">
                Any questions? Feel free to ask us.
              </h2>
            </motion.div>

            <div className="space-y-4">
              <InputWrapper>
                <div className="relative">
                  <User className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="name"
                    {...register("name")}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    placeholder="Full Name"
                  />
                  {errors.name && (
                    <span className="text-red-500 text-xs mt-1 block">
                      {errors.name.message}
                    </span>
                  )}
                </div>
              </InputWrapper>

              <div className="flex flex-col md:flex-row gap-4">
                <InputWrapper>
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      {...register("email")}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      placeholder="Your Email"
                    />
                    {errors.email && (
                      <span className="text-red-500 text-xs mt-1 block">
                        {errors.email.message}
                      </span>
                    )}
                  </div>
                </InputWrapper>

                <InputWrapper>
                  <div className="relative flex-1">
                    <Phone className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      {...register("phone")}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      placeholder="Phone Number"
                    />
                    {errors.phone && (
                      <span className="text-red-500 text-xs mt-1 block">
                        {errors.phone.message}
                      </span>
                    )}
                  </div>
                </InputWrapper>
              </div>

              <InputWrapper>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                  <textarea
                    id="message"
                    rows={4}
                    {...register("message")}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    placeholder="Your Message"
                  />
                  {errors.message && (
                    <span className="text-red-500 text-xs mt-1 block">
                      {errors.message.message}
                    </span>
                  )}
                </div>
              </InputWrapper>
            </div>

            <motion.div
              className="text-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                type="submit"
                disabled={isSubmitting}
                className={`rounded-lg px-8 py-3 text-white font-medium transition-all duration-200 ${
                  isSubmitting
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Sending Message...
                  </span>
                ) : (
                  "Send Message"
                )}
              </button>
            </motion.div>
          </form>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </>
  );
};

export default ContactForm;
