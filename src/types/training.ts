export interface Topic {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  venue: string;
  is_active: boolean;
  image: string;
}

export interface TimeSlot {
  id: number;
  topic: Topic;
  start_time: string;
  end_time: string;
  max_participants: number;
  current_participants: number;
  available_spots: number;
  date: string;
}
