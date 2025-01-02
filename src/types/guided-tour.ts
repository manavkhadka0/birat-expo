import * as yup from "yup";

export const TOUR_DATES = [
  "2025-01-24",
  "2025-01-25",
  "2025-01-26",
  "2025-01-27",
  "2025-01-28",
  "2025-01-29",
  "2025-01-30",
  "2025-01-31",
  "2025-02-01",
  "2025-02-02",
] as const;

export const guidedTourSchema = yup.object({
  college_name: yup.string().min(1, "College name is required"),
  district: yup
    .string()
    .min(1, "District is required")
    .required("District is required"),
  municipality: yup
    .string()
    .min(1, "Municipality is required")
    .required("Municipality is required"),
  ward: yup.string().min(1, "Ward is required").required("Ward is required"),
  phone: yup
    .string()
    .matches(/^\+?1?\d{9,15}$/, "Invalid phone number")
    .required("Phone number is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  contact_person_name: yup.string().min(1, "Contact person name is required"),
  designation: yup.string().min(1, "Designation is required"),
  mobile_no: yup.string().matches(/^\+?1?\d{9,15}$/, "Invalid mobile number"),
  tour_date: yup.string().required("Tour date is required"),
  number_of_students: yup
    .number()
    .min(1, "At least 1 student required")
    .max(50, "Maximum 50 students allowed"),
  student_level: yup
    .string()
    .oneOf(
      ["10+2", "Bachelors", "Masters", "Mixed"],
      "Please select a valid student level"
    ),
});

export type GuidedTourFormData = yup.InferType<typeof guidedTourSchema>;
