import { RSVPEmailJaneTemplate } from "@/components/rsvp-email-jane-template";
import { RSVPFormData } from "@/types/invitation";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API);

export async function POST(request: Request) {
  try {
    const data: RSVPFormData = await request.json();

    // Send email to both the respondent (if email provided) and admin
    const emailRecipients = ["biratexpo2024@gmail.com"]; // Add your admin email
    if (data.email) {
      emailRecipients.push(data.email);
    }

    const { data: emailResponse, error } = await resend.emails.send({
      from: "Birat Expo 2025 <info@baliyoventures.com>",
      to: emailRecipients,
      subject: `RSVP Response - ${data.name} from ${data.company_name}`,
      react: RSVPEmailJaneTemplate({ data }),
    });

    if (error) {
      console.error("Error sending email:", error);
      return Response.json({ error: "Failed to send email" }, { status: 500 });
    }

    // TODO: Save to database if needed
    // const dbResponse = await saveToDatabase(data);

    return Response.json({
      message: "RSVP submitted successfully and confirmation email sent",
      data: emailResponse,
    });
  } catch (error) {
    console.error("RSVP submission error:", error);
    return Response.json({ error: "Failed to submit RSVP" }, { status: 500 });
  }
}
