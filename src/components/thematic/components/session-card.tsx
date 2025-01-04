import { ThematicSession } from "@/types/thematic";
import { CalendarDays, Clock } from "lucide-react";

interface SessionCardProps {
  session: ThematicSession;
  onClick: (session: ThematicSession) => void;
}

export function SessionCard({ session, onClick }: SessionCardProps) {
  return (
    <div
      className="flex flex-col bg-white rounded-2xl shadow-lg hover:shadow-xl 
                 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={() => onClick(session)}
    >
      <div className="p-8">
        <div className="flex flex-col h-full">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {session.title}
          </h3>

          <div className="mt-auto space-y-3">
            <div className="flex items-center">
              <CalendarDays className="h-5 w-5 mr-2 text-blue-600" />
              <span className="font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm">
                {session.date}
              </span>
            </div>

            <div className="flex items-center text-gray-600">
              <Clock className="h-5 w-5 mr-2" />
              <span className="text-sm">
                {session.start_time} - {session.end_time}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
