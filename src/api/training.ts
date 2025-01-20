import { fetcher } from "@/lib/axios";
import { Topic } from "@/types/training";
import { useMemo } from "react";
import useSWR from "swr";

export function useGetAvailableSessions() {
  const URL =
    "https://yachu.baliyoventures.com/api/registrations/available-sessions/";

  const { data, error, isLoading, isValidating } = useSWR<Topic[]>(
    URL,
    fetcher
  );

  const memoizedValue = useMemo(
    () => ({
      sessions: data || [],
      sessionsLoading: isLoading,
      sessionsError: error,
      sessionsValidating: isValidating,
      sessionsEmpty: !isLoading && !data?.length,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export async function registerForTraining(formData: FormData) {
  try {
    const response = await fetch(
      "https://yachu.baliyoventures.com/api/registrations/",
      {
        method: "POST",
        body: formData,
      }
    );

    const data: any = await response.json();

    if (!response.ok) {
      if (data.error) {
        throw new Error(data.error);
      }
      throw new Error("Registration failed. Please try again.");
    }

    // After successful registration, send confirmation email
    try {
      const emailResponse = await fetch("/api/training-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!emailResponse.ok) {
        console.error("Failed to send confirmation email");
      }
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred. Please try again.");
  }
}
