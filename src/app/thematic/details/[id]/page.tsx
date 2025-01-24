"use client";

import { useGetThematicSessions } from "@/api/thematic";
import ThematicSessions from "@/components/thematic/thematic-sessions";
import { Panelist, SubSession, Thematicpanelists } from "@/types/thematic";
import { useParams } from "next/navigation";
import Image from "next/image";

export default function ThematicSessionDetails() {
  const { id } = useParams();
  const { thematicSessions, thematicSessionsLoading } =
    useGetThematicSessions();

  const session = thematicSessions?.find((s) => s.id === Number(id));

  if (thematicSessionsLoading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!session) {
    return <div>Session not found</div>;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-violet-600 text-white">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {session.title}
          </h1>
          <div className="flex flex-wrap gap-6 text-lg mb-8">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-6 h-6" />
              <span>{new Date(session.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-6 h-6" />
              <span>{`${session.start_time} - ${session.end_time}`}</span>
            </div>
            {}
          </div>

          {/* Registration Button */}
          <a
            href={`/thematic/register?session=${session.id}`}
            className="inline-flex items-center px-8 py-4 text-lg rounded-full text-white font-medium 
                     bg-gradient-to-r from-yellow-500 to-yellow-600 
                     hover:from-yellow-600 hover:to-yellow-700 
                     transition-all duration-200 shadow-lg hover:shadow-xl
                     transform hover:-translate-y-1"
          >
            Register for This Session
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
        </div>
      </div>

      {/* Description Section */}
      {/* <div className="max-w-7xl mx-auto px-4 py-16">
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: session.description }}
        />
      </div> */}

      {/* Sub Sessions Grid */}
      {session.sub_sessions.length > 0 && (
        <div className="bg-gradient-to-b from-gray-50 to-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">
                Session Details
              </h2>
              <div className="mt-4 text-gray-600">
                Explore detailed information about each session and our
                distinguished speakers
              </div>
            </div>
            <ThematicPanelists thematicpanelists={session.thematicpanelists} />
            <div className="grid gap-12 lg:gap-16">
              {session.sub_sessions.map((subSession) => (
                <SubSessionCard key={subSession.id} subSession={subSession} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Other Sessions */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Other Sessions
          </h2>
          <ThematicSessions />
          
        </div>
      </div>
    </div>
  );
}

function SubSessionCard({ subSession }: { subSession: SubSession }) {
  return (

    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-8 shadow-lg border border-gray-100">
      {/* Title Section with decorative elements */}
      <div className="relative mb-8">
        <div className="absolute -left-8 top-0 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-violet-600 rounded-full" />
        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">
          {subSession.title}
        </h3>
        <div
          className="mt-3 prose-sm"
          dangerouslySetInnerHTML={{ __html: subSession.description }}
        />
      </div>

      {/* Panelists Section */}
      <div className="space-y-6">
        {/* Group panelists by role */}
        {Object.entries(
          subSession.panelists.reduce((acc, panelist) => {
            const role = panelist.role || "Speaker";
            if (!acc[role]) acc[role] = [];
            acc[role].push(panelist);
            return acc;
          }, {} as Record<string, Panelist[]>)
        ).map(([role, panelists]) => (
          <div key={role} className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              {role}
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              {panelists.map((panelist, idx) => (
                <PanelistCard key={idx} panelist={panelist} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function ThematicPanelists({ thematicpanelists }: { thematicpanelists: Thematicpanelists[] }) {
  return (
      <div className="grid gap-6 flex">
      {thematicpanelists.map((panelist, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 relative overflow-hidden h-[160px]"
        >
          <div className="absolute top-4 right-4">
            <span className="px-4 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-medium whitespace-nowrap">
              {panelist.role}
            </span>
          </div>

          <div className="flex items-start gap-6 h-full">
            <div className="relative shrink-0 w-[108px] h-[108px]">
              <Image
                src={panelist.profile_image || "/placeholder.svg"}
                alt=""
                fill
                className="rounded-full object-cover"
                sizes="108px"
              />
            </div>

            <div className="flex-1 min-w-0 overflow-hidden">
              <h3 className="text-2xl font-bold text-gray-900 mb-1 truncate">{panelist.name}</h3>
              {panelist.company && <p className="text-gray-600 text-lg line-clamp-2">{panelist.company}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PanelistCard({ panelist }: { panelist: Panelist }) {
  return (
    <div className="group relative bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      {/* Role Badge */}
      <div className="absolute -top-3 right-4 px-3 py-1 bg-gradient-to-r from-blue-500 to-violet-600 text-white text-xs font-medium rounded-full">
        {panelist.role}
      </div>

      {/* Profile Section */}
      <div className="flex items-start space-x-4">
        {/* Profile Image or Placeholder */}
        <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-white shadow-lg">
          {panelist.profile_image ? (
            <img
              src={panelist.profile_image}
              alt={panelist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {panelist.name}
          </h4>
          {panelist.company && (
            <p className="text-sm text-gray-600 mt-1">{panelist.company}</p>
          )}
          {panelist.biodata && (
            <div
              className="text-sm text-gray-500 mt-2 line-clamp-2"
              dangerouslySetInnerHTML={{ __html: panelist.biodata }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
