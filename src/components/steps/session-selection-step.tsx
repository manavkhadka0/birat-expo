import { Topic } from "@/types/training";
import { format, eachDayOfInterval } from "date-fns";
import { CalendarIcon } from "@heroicons/react/24/outline";
import SessionCard from "../session-card";

interface SessionSelectionStepProps {
  topics: Topic[];
  register: any;
  errors: any;
  watch: any;
  setValue: any;
  selectedTopic: Topic | null;
  setSelectedTopic: (topic: Topic | null) => void;
  onNext: (data: any) => void;
}

export function SessionSelectionStep({
  topics,
  errors,
  watch,
  setValue,
  selectedTopic,
  setSelectedTopic,
  onNext,
}: SessionSelectionStepProps) {
  const selectedTimeSlot = watch("time_slot");
  const selectedDate = watch("date");

  const canProceed = selectedTimeSlot && selectedDate && selectedTopic;

  const getDatesBetween = (startDate: string, endDate: string) => {
    return eachDayOfInterval({
      start: new Date(startDate),
      end: new Date(endDate),
    });
  };

  return (
    <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Select Training Session
      </h2>

      {/* Topic Selection */}
      <div className="space-y-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Available Topics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className={`p-6 rounded-lg border-2 transition-all cursor-pointer ${
                selectedTopic?.id === topic.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => setSelectedTopic(topic)}
            >
              <h4 className="text-lg font-semibold mb-2">{topic.name}</h4>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CalendarIcon className="w-4 h-4" />
                <span>
                  {format(new Date(topic.start_date), "MMM d")} -{" "}
                  {format(new Date(topic.end_date), "MMM d, yyyy")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Date and Time Selection */}
      {selectedTopic && (
        <div className="space-y-8">
          {/* Date Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Select Date
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {getDatesBetween(
                selectedTopic.start_date,
                selectedTopic.end_date
              ).map((date) => (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => setValue("date", date.toISOString())}
                  className={`p-4 rounded-lg border transition-all ${
                    watch("date") === date.toISOString()
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">
                      {format(date, "EEE")}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {format(date, "d")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {format(date, "MMM yyyy")}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            {errors.date && (
              <p className="mt-2 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          {/* Time Slots */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Available Time Slots
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedTopic.time_slots.map((slot) => (
                <SessionCard
                  key={slot.id}
                  topic={selectedTopic}
                  slot={slot}
                  isSelected={selectedTimeSlot === slot.id}
                  onSelect={(slotId) => setValue("time_slot", slotId)}
                  disabled={slot.available_spots === 0}
                />
              ))}
            </div>
            {errors.time_slot && (
              <p className="mt-2 text-sm text-red-600">
                {errors.time_slot.message}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          disabled={!canProceed}
          onClick={() =>
            onNext({
              time_slot: selectedTimeSlot,
              date: selectedDate,
              topic_id: selectedTopic?.id,
            })
          }
          className={`px-6 py-2 rounded-lg text-white ${
            canProceed
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Next Step
        </button>
      </div>
    </section>
  );
}
