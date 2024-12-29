import Image from "next/image";

interface ProblemStatement {
  number: number;
  title: string;
  bgColor: string;
  numberColor: string;
}

const problemStatements: ProblemStatement[] = [
  {
    number: 1,
    title:
      "Increasing the value of agricultural products in local and global markets",
    bgColor: "bg-green-50",
    numberColor: "text-green-600",
  },
  {
    number: 2,
    title: "Increase the tourist flow in Koshi Province",
    bgColor: "bg-blue-50",
    numberColor: "text-blue-600",
  },
  {
    number: 3,
    title: "Simplifying access to essential services through technology",
    bgColor: "bg-amber-50",
    numberColor: "text-amber-600",
  },
  {
    number: 4,
    title:
      "Improving urban living conditions with smarter infrastructure solutions",
    bgColor: "bg-sky-50",
    numberColor: "text-sky-600",
  },
  {
    number: 5,
    title:
      "Making agriculture more attractive and viable for younger generations",
    bgColor: "bg-rose-50",
    numberColor: "text-rose-600",
  },
];

export default function StartupProblemStatement() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Problem Statements
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            Choose from these key challenges facing Koshi Province and develop
            innovative solutions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {problemStatements.map((problem) => (
            <div
              key={problem.number}
              className="p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`${problem.bgColor} py-3 px-6 rounded-lg w-12 h-12 flex items-center justify-center`}
                >
                  <span className={`${problem.numberColor} text-xl font-bold`}>
                    {problem.number}
                  </span>
                </div>
                <p className="text-lg font-medium text-gray-800">
                  {problem.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
