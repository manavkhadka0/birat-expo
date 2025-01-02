import { ThematicRegistrationResponse } from "@/types/thematic";

export async function registerForThematic(
  formData: ThematicRegistrationResponse
) {
  try {
    // const response = await fetch(
    //   "https://yachu.baliyoventures.com/api/thematic-registrations/",
    //   {
    //     method: "POST",
    //     body: formData,
    //   }
    // );

    // const data = await response.json();

    // if (!response.ok) {
    //   if (data.error) {
    //     throw new Error(data.error);
    //   }
    //   throw new Error("Registration failed. Please try again.");
    // }

    console.log(formData);

    try {
      const emailResponse = await fetch("/api/thematic-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!emailResponse.ok) {
        console.error("Failed to send confirmation email");
      }
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
    }

    // return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred. Please try again.");
  }
}
