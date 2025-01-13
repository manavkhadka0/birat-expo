import { ThematicSession } from "@/types/thematic";
import { CalendarDays, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface SessionCardProps {
  session: ThematicSession;
}

export function SessionCard({ session }: SessionCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/thematic/details/${session.id}`)}
      className="cursor-pointer flex flex-col items-start justify-between rounded-2xl border border-gray-200 p-8 hover:border-blue-500 transition-all duration-200 hover:shadow-lg"
    >
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
  );
}
