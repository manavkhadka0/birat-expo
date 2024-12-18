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
      className={`cursor-pointer p-6 rounded-lg transition-all duration-200 ${
        isSelected
          ? "bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-500 shadow-blue-100"
          : disabled
          ? "bg-gray-50 border border-gray-200 opacity-60 cursor-not-allowed"
          : "bg-white border border-gray-200 hover:shadow-lg hover:border-blue-200"
      }`}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg
              className={`w-5 h-5 ${
                isSelected ? "text-blue-500" : "text-gray-400"
              }`}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-sm font-bold text-gray-600">
              {format(new Date(`2000-01-01T${slot.start_time}`), "h:mm a")} -
              {format(new Date(`2000-01-01T${slot.end_time}`), "h:mm a")}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium
            ${
              slot.available_spots > 5
                ? "bg-green-100 text-green-800"
                : slot.available_spots > 0
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {slot.available_spots} spots left
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <p className="text-sm text-gray-600">{topic.venue}</p>
          </div>
        </div>
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
