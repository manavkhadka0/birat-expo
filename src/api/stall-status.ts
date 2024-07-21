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
