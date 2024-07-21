import EmailTemplate from "@/components/email-template";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface FormData {
  firstName?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

export async function POST(request: Request) {
  try {
    const body: FormData = await request.json();

    // Provide default values for potentially missing fields
    const templateProps = {
      firstName: body.firstName || "Not provided",
      email: body.email || "Not provided",
      phone: body.phone || "Not provided",
      subject: body.subject || "No subject",
      message: body.message || "No message",
    };

    const { data, error } = await resend.emails.send({
      from: "BIRAT EXPO 2024 Notifications <notifications@biratexpo2024.com>",
      to: ["admin@biratexpo2024.com"], // Replace with actual admin email
      subject: "New Contact Inquiry for BIRAT EXPO 2024",
      react: EmailTemplate(templateProps),
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
