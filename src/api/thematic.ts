import { fetcher } from "@/lib/axios";
import { ThematicRegistration, ThematicSession } from "@/types/thematic";
import { useMemo } from "react";
import useSWR from "swr";

interface RegistrationError {
  error?: string;
  message?: string;
}

export async function registerForThematic(
  formData: ThematicRegistration
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
    // Main registration request
    const response = await fetchWithTimeout(
      "https://yachu.baliyoventures.com/api/thematic-registrations/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    let data: any;
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

    // Send confirmation email in the background
    Promise.resolve().then(async () => {
      try {
        const emailResponse = await fetchWithTimeout(
          "/api/thematic-registration",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );

        if (!emailResponse.ok) {
          console.error(
            "Failed to send confirmation email:",
            await emailResponse.text().catch(() => "Unknown error")
          );
        }
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
      }
    });

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

export function useGetThematicSessions() {
  const URL = "https://yachu.baliyoventures.com/api/thematic-sessions/";

  const { data, error, isLoading, isValidating } = useSWR<ThematicSession[]>(
    URL,
    fetcher
  );

  const memoizedValue = useMemo(
    () => ({
      thematicSessions: data || [],
      thematicSessionsLoading: isLoading,
      thematicSessionsError: error,
      thematicSessionsValidating: isValidating,
      thematicSessionsEmpty: !isLoading && !data?.length,
    }),
    [data, isLoading, isValidating, error]
  );

  return memoizedValue;
}
