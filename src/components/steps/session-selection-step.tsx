import { Topic, TimeSlot } from "@/types/training";
import { format, eachDayOfInterval } from "date-fns";
import { CalendarIcon } from "@heroicons/react/24/outline";
import SessionCard from "../session-card";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const selectedTimeSlot = watch("time_slot");
  const selectedDate = watch("date");

  // Fetch time slots when both topic and date are selected
  useEffect(() => {
    async function fetchTimeSlots() {
      if (selectedTopic && selectedDate) {
        setIsLoadingSlots(true);
        try {
          const date = format(new Date(selectedDate), "yyyy-MM-dd");
          const response = await fetch(
            `/api/timeslots/?date=${date}&topic=${selectedTopic.id}`
          );
          const data = await response.json();
          setTimeSlots(data);
        } catch (error) {
          console.error("Error fetching time slots:", error);
          setTimeSlots([]);
        } finally {
          setIsLoadingSlots(false);
        }
      }
    }

    fetchTimeSlots();
  }, [selectedTopic, selectedDate]);

  const canProceed = selectedTimeSlot && selectedDate && selectedTopic;

  const getDatesBetween = (startDate: string, endDate: string) => {
    return eachDayOfInterval({
      start: new Date(startDate),
      end: new Date(endDate),
    });
  };

  const getDateRange = () => {
    if (!selectedTopic) return { minDate: null, maxDate: null };
    return {
      minDate: new Date(selectedTopic.start_date),
      maxDate: new Date(selectedTopic.end_date),
    };
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
            <div className="max-w-md">
              <DatePicker
                selected={selectedDate ? new Date(selectedDate) : null}
                onChange={(date: Date | null) =>
                  setValue("date", date?.toISOString() || "")
                }
                minDate={getDateRange().minDate || undefined}
                maxDate={getDateRange().maxDate || undefined}
                dateFormat="MMMM d, yyyy"
                placeholderText="Select a date"
                inline
                calendarClassName="border border-gray-200 rounded-lg shadow-md"
                wrapperClassName="w-full"
                dayClassName={(date: Date) =>
                  `hover:bg-blue-50 rounded-full w-8 h-8 mx-auto flex items-center justify-center ${
                    selectedDate === date.toISOString()
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : ""
                  }`
                }
              />
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
              {isLoadingSlots ? (
                <div className="col-span-3 text-center py-4">
                  Loading time slots...
                </div>
              ) : timeSlots.length > 0 ? (
                timeSlots.map((slot) => (
                  <SessionCard
                    key={slot.id}
                    topic={selectedTopic}
                    slot={slot}
                    isSelected={selectedTimeSlot === slot.id}
                    onSelect={(slotId) => setValue("time_slot", slotId)}
                    disabled={slot.available_spots === 0}
                  />
                ))
              ) : (
                <div className="col-span-3 text-center py-4">
                  No time slots available for the selected date
                </div>
              )}
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
