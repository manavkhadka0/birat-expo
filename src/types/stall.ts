export type StallType =
  | "National Prime"
  | "National General"
  | "International"
  | "Agro and MSME"
  | "Automobiles"
  | "Food Stalls"
  | "BDS Providers Stall";

export type StallStatus = "Approved" | "Pending" | "Booked";

export type StallBooking = {
  company: string;
  stall_no: string;
  status: StallStatus;
};

export type AllStalls = [string, string, StallStatus];

export type StallTypeData = {
  booked: StallBooking[];
  pending: StallBooking[];
  stall_no_booked: AllStalls[];
  stall_no_pending: AllStalls[];
};
