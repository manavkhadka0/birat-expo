import { GuidedTourFormData, GuidedTourResponse } from "@/types/guided-tour";

interface RegistrationError {
  error?: string;
  message?: string;
}

export async function registerForGuidedTour(
  formData: GuidedTourFormData
): Promise<any> {
  const FETCH_TIMEOUT = 10000; // 10 seconds timeout

  const fetchWithTimeout = async (url: string, options: RequestInit) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  try {
    // Main registration request to backend
    const response = await fetchWithTimeout(
      "https://yachu.baliyoventures.com/api/guided-tours/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    let data: GuidedTourResponse;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error("Failed to parse server response");
    }

    if (!response.ok) {
      const errorMessage =
        (data as RegistrationError).error ||
        (data as RegistrationError).message ||
        "Registration failed. Please try again.";
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw new Error("An unexpected error occurred. Please try again.");
  }
}
