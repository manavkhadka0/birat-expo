import * as yup from "yup";

export type RSVPStatus = "ACCEPTED" | "REJECTED";

export const rsvpSchema = yup.object({
  name: yup.string().required("Name is required"),
  designation: yup.string().required("Designation is required"),
  company_name: yup.string().required("Company name is required"),
  phone_number: yup
    .string()
    .matches(/^\+?1?\d{9,15}$/, "Invalid phone number")
    .optional(),
  email: yup.string().email("Invalid email format").optional(),
  status: yup
    .string()
    .oneOf(["ACCEPTED", "REJECTED"])
    .required("Please select your response"),
  remarks: yup.string().when("status", {
    is: "REJECTED",
    then: (schema) => schema.required("Please provide a reason for declining"),
    otherwise: (schema) => schema.optional(),
  }),
});

export type RSVPFormData = yup.InferType<typeof rsvpSchema>;
