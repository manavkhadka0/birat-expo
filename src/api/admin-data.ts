import { fetcher } from "@/lib/axios";
import { useMemo } from "react";
import useSWR from "swr";

type StallBooking = {
  id: number;
  company: string;
  address: string;
  chief_executive: string;
  phone: string;
  city: string;
  country: string;
  email: string;
  status: "Pending" | "Approved" | "Rejected";
  stall_type: string;
  stall_no: string;
  merge_or_separate: "Merge" | "Separate";
  voucher: string;
  total_amount: string;
  advance_amount: string;
  remaining_amount: string;
  amount_in_words: string;
  terms_and_conditions_accepted: boolean;
  created_at: string;
  updated_at: string;
};

export function useGetStallData() {
  const URL = "https://yachu.baliyoventures.com/api/stall/";

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      stallData: (data as StallBooking[]) || [],
      stallDataLoading: isLoading,
      stallDataError: error,
      stallDataValidating: isValidating,
      stallDataEmpty: !isLoading && !data?.length,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
