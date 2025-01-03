export interface ThematicSession {
  id: number;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  description: string;
  time: string;
}

export interface ThematicRegistration {
  id?: number;
  name: string;
  organization: string;
  designation: string;
  address: string;
  email: string;
  contact: string;
  sessions: number[]; // Array of session IDs the participant registered for
  travel_arrive_date: string;
  travel_back_date: string;
  participant: string;
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
  const response = await fetch('https://yachu.baliyoventures.com/api/thematic-sessions/');
  if (!response.ok) {
    throw new Error('Failed to fetch thematic sessions');
  }
  return response.json();
}
