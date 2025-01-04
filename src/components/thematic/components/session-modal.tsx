import { ThematicSession } from "@/types/thematic";
import { CalendarDays, Clock, X } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";

interface SessionModalProps {
  session: ThematicSession;
  onClose: () => void;
}

export function SessionModal({ session, onClose }: SessionModalProps) {
  const createMarkup = (html: string) => {
    return { __html: DOMPurify.sanitize(html) };
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 p-6">
            <div className="flex justify-between items-start">
              <h3 className="text-2xl font-bold text-gray-900">
                {session.title}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <CalendarDays className="h-5 w-5 mr-2 text-blue-600" />
                <span className="font-medium text-gray-700">
                  {session.date}
                </span>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                <span className="font-medium text-gray-700">
                  {session.start_time} - {session.end_time}
                </span>
              </div>
            </div>

            <div className="prose max-w-none">
              <div
                className="text-gray-600"
                dangerouslySetInnerHTML={createMarkup(session.description)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
