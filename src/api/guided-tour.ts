import { GuidedTourFormData } from "@/types/guided-tour";

export async function registerForGuidedTour(formData: GuidedTourFormData) {
  try {
    // Send confirmation email
    const emailResponse = await fetch("/api/guided-tour-registration", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!emailResponse.ok) {
      throw new Error("Failed to send confirmation email");
    }

    return emailResponse.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred. Please try again.");
  }
}
