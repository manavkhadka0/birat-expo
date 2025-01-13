export interface Panelist {
  role: string;
  name: string;
  profile_image: string | null;
  company: string | null;
  location: string | null;
  biodata: string;
}

export interface SubSession {
  id: number;
  title: string;
  description: string;
  panelists: Panelist[];
}

export interface ThematicSession {
  id: number;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  description: string;
  sub_sessions: SubSession[];
}

export interface ThematicRegistration {
  id?: number;
  name: string;
  organization: string;
  designation: string;
  address: string;
  email: string;
  contact: string;
  sessions: number[];
  travel_arrive_date: string;
  travel_departure_date: string;
  participant: string;
  checked_in?: boolean;
  check_in_date?: string;
  hotel?: string;
  flight_no?: string;
  flight_time?: string;
  food: string;
  hotel_accomodation?: string;
  airline?: string;
}

export interface ThematicRegistrationResponse {
  id?: number;
  name: string;
  organization: string;
  designation: string;
  address: string;
  email: string;
  contact: string;
  sessions: ThematicSession[];
}

export async function fetchThematicSessions(): Promise<ThematicSession[]> {
  const response = await fetch(
    "https://yachu.baliyoventures.com/api/thematic-sessions/"
  );
  if (!response.ok) {
    throw new Error("Failed to fetch thematic sessions");
  }
  return response.json();
}
