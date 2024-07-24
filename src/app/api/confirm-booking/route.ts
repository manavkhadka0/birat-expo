import StallBookingTemplate from "@/components/confirmed-booking-mail";
import EmailTemplate from "@/components/email-template";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API);

// const schema = yup.object().shape({
//     company: yup.string().required("Company/Organization is required"),
//     address: yup.string().required("Address is required"),
//     chief_executive: yup.string().required("Chief Executive name is required"),
//     phone: yup.string().required("Phone/Mobile is required"),
//     city: yup.string().required("City is required"),
//     country: yup.string().required("Country is required"),
//     email: yup.string().email("Invalid email").required("Email is required"),
//     stall_type: yup.string().required("Please select a stall type"),
//     stall_no: yup.string().required("Stall number is required"),
//     merge_or_separate: yup.string().required("Please select merge or separate"),
//     voucher: yup
//       .mixed()
//       .test("fileSize", "File size is too large", function (value) {
//         if (!value || !(value instanceof FileList)) return true;
//         return value[0]?.size <= MAX_FILE_SIZE;
//       })
//       .test("fileFormat", "Unsupported file format", function (value) {
//         if (!value || !(value instanceof FileList)) return true;
//         return SUPPORTED_FORMATS.includes(value[0]?.type);
//       })
//       .required("Voucher is required"),
//     total_amount: yup
//       .number()
//       .positive("Amount must be positive")
//       .required("Total amount is required"),
//     advance_amount: yup
//       .number()
//       .positive("Amount must be positive")
//       .required("Advance amount is required"),
//     remaining_amount: yup.number().required("Remaining amount is required"),
//     amount_in_words: yup.string().required("Amount in words is required"),
//     terms_and_conditions: yup
//       .boolean()
//       .oneOf([true], "Please accept terms and conditions"),
//   });
interface FormData {
  company?: string;
  address?: string;
  chief_executive?: string;
  phone?: string;
  city?: string;
  country?: string;
  email?: string;
  stall_type?: string;
  stall_no?: string;
  merge_or_separate?: string;
  total_amount?: number;
  advance_amount?: number;
  remaining_amount?: number;
  amount_in_words?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("Received contact inquiry:", body);

    // Provide default values for potentially missing fields
    // const templateProps = {
    //   name: body.name || "Not provided",
    //   email: body.email || "Not provided",
    //   phone: body.phone || "Not provided",
    //   message: body.message || "No message",
    // };

    const templateProps = {
      company: body.company || "Not provided",
      address: body.address || "Not provided",
      chief_executive: body.chief_executive || "Not provided",
      phone: body.phone || "Not provided",
      city: body.city || "Not provided",
      country: body.country || "Not provided",
      email: body.email || "Not provided",
      stall_type: body.stall_type || "Not provided",
      stall_no: body.stall_no || "Not provided",
      merge_or_separate: body.merge_or_separate || "Not provided",
      total_amount: body.total_amount || 0,
      advance_amount: body.advance_amount || 0,
      remaining_amount: body.remaining_amount || 0,
      amount_in_words: body.amount_in_words || "Not provided",
    };

    const { data, error } = await resend.emails.send({
      from: "Birat Expo 2024 Contact <info@baliyoventures.com>",
      to: [templateProps.email.toString(), "biratexpo2024@gmail.com"], // Replace with actual admin email
      subject: `Your Stall Booking for Birat Expo 2024`,
      react: StallBookingTemplate({ data: templateProps }),
    });

    if (error) {
      console.error("Error sending email:", error);
      return Response.json({ error: "Failed to send email" }, { status: 500 });
    }

    return Response.json({
      message: "Contact inquiry received and notification sent",
      data,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return Response.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
