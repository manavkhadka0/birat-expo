export interface ThematicSession {
  id: number;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  description: string;
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

export const THEMATIC_SESSIONS = [
  {
    id: 1,
    title: "Introducing the CIM as Centre of Excellence",
    date: "2025-01-26",
    start_time: "2:00 PM",
    end_time: "5:00 PM",
    description: "Thematic Area 1: Introducing the CIM as Centre of Excellence",
  },
  {
    id: 2,
    title: "Enterprising EAST",
    date: "2025-01-27",
    start_time: "2:00 PM",
    end_time: "5:00 PM",
    description: "Thematic Area 2: Enterprising EAST",
  },
  {
    id: 3,
    title: "Digital Koshi: AI for the New Generation",
    date: "2025-01-28",
    start_time: "1:00 PM",
    end_time: "5:00 PM",
    description:
      "Thematic Area 3: Digital Koshi: AI for the New Generation: Empowering Agriculture, SMEs, and Industries",
  },
  {
    id: 4,
    title: "Bridging Economies: Intra-Regional Trade",
    date: "2025-01-29",
    start_time: "2:00 PM",
    end_time: "5:00 PM",
    description:
      "Thematic Area 4: Bridging Economies: Intra-Regional Trade and Investment Opportunities and Challenges in Koshi",
  },
  {
    id: 5,
    title: "Strengthening TVET Ecosystem",
    date: "2025-01-30",
    start_time: "2:00 PM",
    end_time: "5:00 PM",
    description: "Thematic Area 5: Strengthening TVET Ecosystem",
  },
  {
    id: 6,
    title: "Vision Koshi Hackathon and Startup Conference",
    date: "2025-01-31",
    start_time: "11:00 AM",
    end_time: "5:00 PM",
    description:
      "Thematic Area 6: Vision Koshi Hackathon and Startup Conference",
  },
  {
    id: 7,
    title: "Quality Power Supply for Industrialization in Koshi Province",
    date: "2025-02-01",
    start_time: "11:00 AM",
    end_time: "2:00 PM",
    description:
      "Thematic Area 7: Quality Power Supply for Industrialization in Koshi Province: Current State, Issues and Challenges",
  },
  {
    id: 8,
    title: "Industry Minister at CIM Business Clinic",
    date: "2025-02-02",
    start_time: "2:00 PM",
    end_time: "5:00 PM",
    description:
      "Thematic Area 8: Industry Minister at CIM Business Clinic: Solving Industry Challenges",
  },
];
