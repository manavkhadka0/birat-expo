import SponsorEmailTemplate from "@/components/sponsor-booking-template";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API);

interface BookingData {
  stallType: string;
  stallId: string;
  companyName: string;
  companyEmail: string;
  contactNumber: string;
}

export async function POST(request: Request) {
  try {
    const body: BookingData = await request.json();

    const { data, error } = await resend.emails.send({
      from: "Birat Expo 2025 Booking <info@baliyoventures.com>",
      to: ["biratexpo2024@gmail.com", body.companyEmail],
      subject: `New Stall Booking for Birat Expo 2025`,
      react: SponsorEmailTemplate(body),
    });

    if (error) {
      console.error("Error sending email:", error);
      return Response.json({ error: "Failed to send email" }, { status: 500 });
    }

    return Response.json({
      message: "Booking confirmation received and notification sent",
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
