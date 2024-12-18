import TrainingRegistrationTemplate from "@/components/training-registration-template";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API);

interface RegistrationResponse {
  id: number;
  time_slot: number;
  registration_type: string;
  status: string;
  full_name: string;
  qualification: string;
  gender: string;
  age: number;
  address: string;
  mobile_number: string;
  email: string;
  total_participants: number;
  total_price: number | null;
  payment_method: string;
  payment_screenshot: string;
  agreed_to_no_refund: boolean;
  is_early_bird: boolean;
  is_expo_access: boolean;
  is_free_entry: boolean;
  qr_code: string;
  created_at: string;
  updated_at: string;
}

export async function POST(request: Request) {
  try {
    const body: RegistrationResponse = await request.json();

    // Send email to both the registrant and admin
    const { data, error } = await resend.emails.send({
      from: "Birat Expo 2025 Training <info@baliyoventures.com>",
      to: [body.email, "manavkhadka0@gmail.com"],
      subject: `Training Registration #${body.id} Confirmation - Birat Expo 2025`,
      react: TrainingRegistrationTemplate({ data: body }),
    });

    if (error) {
      console.error("Error sending email:", error);
      return Response.json({ error: "Failed to send email" }, { status: 500 });
    }

    return Response.json({
      message: "Registration successful and confirmation email sent",
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
