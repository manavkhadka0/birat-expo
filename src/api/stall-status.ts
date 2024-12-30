import { fetcher } from "@/lib/axios";
import { AllStalls, StallType, StallTypeData } from "@/types/stall";
import { useMemo } from "react";
import useSWR from "swr";

export function useGetStallTypeData(stallType: StallType) {
  const URL = `https://yachu.baliyoventures.com/api/get-booked-stalls/?stall_type=${encodeURIComponent(
    stallType
  )}`;

  const { data, isLoading, error, isValidating } = useSWR<StallTypeData>(
    URL,
    fetcher
  );

  const memoizedValue = useMemo(() => {
    return {
      stallTypeData: data,
      stallTypeDataLoading: isLoading,
      stallTypeDataError: error,
      stallTypeDataValidating: isValidating,
      stallTypeDataEmpty:
        !isLoading &&
        !data?.booked?.length &&
        !data?.pending?.length &&
        !data?.stall_no_booked?.length &&
        !data?.stall_no_pending?.length,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

// [
//   {
//     id: 1,
//     stall_type: "Main Sponsor",
//     stall_id: "S1",
//     company_name: "Baliyo Ventures",
//     company_email: "baliyoventures@gmail.com",
//     contact_number: "9861884374",
//   },
// ];

export type SponsorStallType = {
  id: number;
  stall_type: string;
  stall_id: string;
  company_name: string;
  company_email: string;
  contact_number: string;
};

export function useGetSponsorStallStatus() {
  const URL = `https://yachu.baliyoventures.com/api/sponsor`;

  const { data, isLoading, error, isValidating } = useSWR<SponsorStallType[]>(
    URL,
    fetcher
  );

  const memoizedValue = useMemo(() => {
    return {
      sponsorStallStatus: data,
      sponsorStallStatusLoading: isLoading,
      sponsorStallStatusError: error,
      sponsorStallStatusValidating: isValidating,
      sponsorStallStatusEmpty: !isLoading && !data?.length,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}
