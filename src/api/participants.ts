import { fetcher } from "@/lib/axios";
import { Topic, Registration } from "@/types/training";
import { useMemo } from "react";
import useSWR from "swr";

// {
//     "id": 21,
//     "time_slot": 499,
//     "registration_type": "Single Person",
//     "status": "PENDING",
//     "first_name": "Manav",
//     "last_name": "Khadak",
//     "qualification": "Under SEE",
//     "gender": "Male",
//     "age": 10,
//     "address": "Pulchowk -3, Lalitpur",
//     "mobile_number": "+9779861884374",
//     "email": "manav.baliyoventures@gmail.com",
//     "total_participants": 1,
//     "total_price": "300.00",
//     "payment_method": "Nabil Bank",
//     "payment_screenshot": "https://yachu.baliyoventures.com/media/WhatsApp_Image_2024-12-23_at_11.17.06_cCj5Viw.jpeg",
//     "agreed_to_no_refund": true,
//     "is_early_bird": true,
//     "is_expo_access": false,
//     "is_free_entry": false,
//     "qr_code": "https://yachu.baliyoventures.com/media/qr_codes/qr_code_21.png",
//     "created_at": "2024-12-30T08:36:44.434894Z",
//     "updated_at": "2024-12-30T08:36:44.434929Z",
//     "group_members": []
// }

type Participant = {
  id: number;
  time_slot: number;
  registration_type: string;
  status: string;
  first_name: string;
  last_name: string;
  qualification: string;
  gender: string;
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
