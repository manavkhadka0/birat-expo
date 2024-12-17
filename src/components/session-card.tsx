import { TimeSlot, Topic } from "@/types/training";
import { format } from "date-fns";

interface SessionCardProps {
  topic: Topic;
  slot: TimeSlot;
  isSelected: boolean;
  onSelect: (slotId: number) => void;
  disabled?: boolean;
}

export default function SessionCard({
  topic,
  slot,
  isSelected,
  onSelect,
  disabled,
}: SessionCardProps) {
  return (
    <div
      onClick={() => !disabled && onSelect(slot.id)}
      className={`cursor-pointer p-6 rounded-lg shadow-md transition-all ${
        isSelected
          ? "border-2 border-blue-500 bg-blue-50"
          : disabled
          ? "border border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
          : "border border-gray-200 bg-white hover:shadow-lg"
      }`}
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{topic.name}</h3>
      <div className="space-y-2 text-gray-600">
        <p className="flex items-center gap-2">
          <span className="font-medium">Date:</span>
          {format(new Date(topic.start_date), "MMMM d, yyyy")}
        </p>
        <p className="flex items-center gap-2">
          <span className="font-medium">Time:</span>
          {format(new Date(`2000-01-01T${slot.start_time}`), "h:mm a")} -
          {format(new Date(`2000-01-01T${slot.end_time}`), "h:mm a")}
        </p>
        <p className="flex items-center gap-2">
          <span className="font-medium">Venue:</span>
          {topic.venue}
        </p>
        <p className="flex items-center gap-2">
          <span className="font-medium">Available Spots:</span>
          {slot.available_spots}
        </p>
        <p className="text-sm">{topic.description}</p>
      </div>
      {isSelected && (
        <div className="mt-4 text-blue-600 font-medium flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Selected
        </div>
      )}
    </div>
  );
}
