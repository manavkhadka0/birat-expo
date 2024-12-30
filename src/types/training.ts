export interface Topic {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  venue: string;
  is_active: boolean;
  image:string;
}

export interface TimeSlot {
  id: number;
  topic: number;
  start_time: string;
  end_time: string;
  max_participants: number;
  current_participants: number;
  available_spots: number;
  date: string;
}

export interface Registration {
  id?: number;
  time_slot: number;
  registration_type: "SINGLE" | "GROUP" | "EXPO_ACCESS";
  status?: "PENDING" | "CONFIRMED" | "CANCELLED";
  full_name: string;
  qualification: "Under SEE" | "10+2" | "Graduate" | "Post Graduate";
  gender: "Male" | "Female" | "Other";
  age: number;
  address: string;
  mobile_number: string;
  email: string;
  total_participants: number;
  total_price?: number;
  payment_method: "Nabil_Bank";
  payment_screenshot?: File;
  agreed_to_no_refund: boolean;
  is_early_bird?: boolean;
  is_expo_access?: boolean;
  is_free_entry?: boolean;
  qr_code?: string;
  created_at?: string;
  updated_at?: string;
}
