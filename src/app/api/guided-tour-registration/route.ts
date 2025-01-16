import GuidedTourEmailTemplate from "@/components/guided-tour/guided-tour-email-template";
import { GuidedTourResponse } from "@/types/guided-tour";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API);

export async function POST(request: Request) {
  try {
    const body: GuidedTourResponse = await request.json();

    const { data, error } = await resend.emails.send({
      from: "Birat Expo 2025 Guided Tour <info@baliyoventures.com>",
      to: [body.email, "biratexpo2024@gmail.com"],
      subject: `Guided Tour Registration Confirmation - ${body.college_name}`,

      react: GuidedTourEmailTemplate({ data: body }),
    });

    if (error) {
      return Response.json({ error: "Failed to send email" }, { status: 500 });
    }

    return Response.json({
      message: "Registration successful and confirmation email sent",
      data,
    });
  } catch (error) {
    return Response.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
