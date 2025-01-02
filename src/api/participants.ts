import { fetcher } from "@/lib/axios";
import { TimeSlot } from "@/types/training";
import { useMemo } from "react";
import useSWR from "swr";

export type Participant = {
  id: number;
  time_slot: number;
  registration_type: "Single Person" | "Group" | "Expo Access";
  status: "Pending" | "Confirmed" | "Cancelled";
  first_name: string;
  last_name: string;
  qualification: string;
  gender: "Male" | "Female" | "Other";
  age: number;
  address: string;
  mobile_number: string;
  email: string;
  total_participants: number;
  total_price: string;
  payment_method: string;
  payment_screenshot: string;
  agreed_to_no_refund: boolean;
  is_early_bird: boolean;
  is_expo_access: boolean;
  is_free_entry: boolean;
  qr_code: string;
  created_at: string;
  updated_at: string;
  group_members: any[];
};

export function useGetParticipants() {
  const URL = `https://yachu.baliyoventures.com/api/registrations/`;

  const { data, error, isLoading, isValidating } = useSWR<Participant[]>(
    URL,
    fetcher
  );

  const memoizedValue = useMemo(
    () => ({
      participants: data,
      participantsLoading: isLoading,
      participantsError: error,
      participantsValidating: isValidating,
      participantsEmpty: !isLoading && !data,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
