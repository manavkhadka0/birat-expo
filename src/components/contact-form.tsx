import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { User, Mail, Phone, MessageSquare, Send } from "lucide-react";
import axios from "axios";

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
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = (data: any) => {
    console.log(data);
    // Handle form submission here
    setIsSubmitting(true);

    axios
      .post("/api/send", data)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="lg:p-8">
      <div className="w-full container mx-auto p-8 flex flex-col items-center justify-center md:flex-row gap-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="lg:w-2/3 space-y-6 mb-20"
        >
          <div>
            <h2 className="text-3xl font-extrabold text-gray-800 mb-10 text-center">
              Any questions? Feel free to ask us.
            </h2>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                id="name"
                {...register("name")}
                className="w-full px-4 py-4 bg-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
                placeholder=" "
              />
              {errors.name && (
                <span className="text-red-500 text-xs line-clamp-1">
                  {errors.name.message}
                </span>
              )}
              <label
                htmlFor="name"
                className="absolute left-4 top-3 text-sm text-gray-500 transition-all duration-200 ease-in-out origin-left transform scale-75 -translate-y-3 pointer-events-none"
              >
                Full Name
              </label>
            </div>

            <div className="flex space-x-4">
              <div className="relative flex-1">
                <input
                  type="email"
                  id="email"
                  {...register("email")}
                  className="w-full px-4 py-4 bg-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
                  placeholder=" "
                />
                {errors.email && (
                  <span className="text-red-500 text-xs line-clamp-1">
                    {errors.email.message}
                  </span>
                )}
                <label
                  htmlFor="email"
                  className="absolute left-4 top-3 text-sm text-gray-500 transition-all duration-200 ease-in-out origin-left transform scale-75 -translate-y-3 pointer-events-none"
                >
                  Your email
                </label>
              </div>
              <div className="relative flex-1">
                <input
                  type="tel"
                  id="phone"
                  {...register("phone")}
                  className="w-full px-4 py-4 bg-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
                  placeholder=" "
                />
                {errors.phone && (
                  <span className="text-red-500 text-xs line-clamp-1">
                    {errors.phone.message}
                  </span>
                )}
                <label
                  htmlFor="phone"
                  className="absolute left-4 top-3 text-sm text-gray-500 transition-all duration-200 ease-in-out origin-left transform scale-75 -translate-y-3 pointer-events-none"
                >
                  Phone
                </label>
              </div>
            </div>

            <div className="relative">
              <textarea
                id="message"
                rows={4}
                {...register("message")}
                className="w-full px-4 py-3 bg-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
              ></textarea>
              {errors.message && (
                <span className="text-red-500 text-xs line-clamp-1">
                  {errors.message.message}
                </span>
              )}
              <label
                htmlFor="message"
                className="absolute  left-4 top-3 text-sm text-gray-500 transition-all duration-200 ease-in-out origin-left transform scale-75 -translate-y-3 pointer-events-none"
              >
                Message
              </label>
            </div>
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
                "Submit Application"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
