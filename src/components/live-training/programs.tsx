import { Topic } from "@/types/training";

type ProgramsProps = {
  sessions: Topic[];
};

export default function Programs({ sessions }: ProgramsProps) {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-indigo-500 to-violet-700 bg-clip-text text-transparent">
        Programs We Offer
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {sessions.map((session, index) => (
          <a
            href={`/live-training/register`}
            key={index}
            className="bg-white p-8 rounded-lg shadow-md text-center hover:bg-gray-100 transition-colors duration-300"
          >
            <div className="w-32 h-32 mx-auto mb-4">
              <img
                src={session.image}
                alt={session.name}
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="text-xl font-bold">{session.name}</h3>
          </a>
        ))}
      </div>
    </div>
  );
}
