import { fetcher } from "@/lib/axios";
import { ThematicRegistration, ThematicSession } from "@/types/thematic";
import { useMemo } from "react";
import useSWRImmutable from 'swr/immutable';


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
  const URL = useMemo(() => "https://yachu.baliyoventures.com/api/thematic-sessions/", []);

  const { data, error, isLoading, isValidating } = useSWRImmutable<ThematicSession[]>(
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

export async function getThematicSessions(): Promise<ThematicSession[]> {
  try {
    const response = await fetch('https://yachu.baliyoventures.com/api/thematic-sessions/');
    if (!response.ok) {
      throw new Error('Failed to fetch thematic sessions');
    }
    const data = await response.json();
    
    // Transform the API data to match our interface format
    return data.map((session: any) => ({
      id: session.id,
      title: session.title,
      date: session.date,
      start_time: formatTime(session.start_time),
      end_time: formatTime(session.end_time),
      description: session.description,
      time: `${formatTime(session.start_time)} - ${formatTime(session.end_time)}`
    }));
  } catch (error) {
    console.error('Error fetching thematic sessions:', error);
    throw error;
  }
}

// Helper function to format time from 24-hour to 12-hour format
function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}
