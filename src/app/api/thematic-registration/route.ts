import ThematicEmailRegistrationTemplate from "@/components/thematic/thematic-registration-email-template";
import { ThematicRegistrationResponse } from "@/types/thematic";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API);

export async function POST(request: Request) {
  try {
    const body: ThematicRegistrationResponse = await request.json();

    // Send email to both the registrant and admin
    const { data, error } = await resend.emails.send({
      from: "Birat Expo 2025 Thematic Training <info@baliyoventures.com>",
      to: [body.email, "Chauhan.ashu0630@gmail.com"],

      subject: `Thematic Training Registration #${body.id} ${
        body.status === "Accepted"
          ? "Accepted"
          : body.status === "Rejected"
          ? "Rejected"
          : "Pending Approval"
      } - Birat Expo 2025`,
      react: ThematicEmailRegistrationTemplate({ data: body }),
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
