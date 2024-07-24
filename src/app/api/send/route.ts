import EmailTemplate from "@/components/email-template";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API);

interface FormData {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

export async function POST(request: Request) {
  try {
    const body: FormData = await request.json();

    // Provide default values for potentially missing fields
    const templateProps = {
      name: body.name || "Not provided",
      email: body.email || "Not provided",
      phone: body.phone || "Not provided",
      message: body.message || "No message",
    };

    const { data, error } = await resend.emails.send({
      from: "Birat Expo 2024 Contact <info@baliyoventures.com>",
      to: ["biratexpo2024@gmail.com"],
      subject: `Contact Enquiry for Birat Expo 2024`,
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
