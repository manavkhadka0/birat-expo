import TrainingEmailRegistrationTemplate from "@/components/training-email-template";
import { TrainingFormDataResponse } from "@/components/training-registration-form";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API);

export async function POST(request: Request) {
  try {
    const body: TrainingFormDataResponse = await request.json();

    // Send email to both the registrant and admin
    const { data, error } = await resend.emails.send({
      from: "Birat Expo 2025 Training <info@baliyoventures.com>",
      to: [body.email, "biratexpo2024@gmail.com"],

      subject: `Training Registration for ${body.first_name} ${
        body.last_name
      }  ${
        body.status === "Confirmed" ? "Confirmed" : "Pending"
      } - Birat Expo 2025`,
      react: TrainingEmailRegistrationTemplate({ data: body }),
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
