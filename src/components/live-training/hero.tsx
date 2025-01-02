import Link from "next/link";
export default function Hero() {
  return (
    <div className="relative bg-gradient-to-r from-blue-50 to-blue-100 overflow-hidden">
      <div className="container max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left content */}
          <div className="z-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 leading-tight">
              We help you Empower Ambitions
              <br />
              and Build Futures.
            </h1>

            <div className="mt-10 py-5">
              <div className="border p-4 rounded-lg bg-white">
                <div className="flex flex-row gap-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    For more details, & queries :
                  </h3>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Contact Coordinator
                </h3>
                <div className="space-y-3">
                  <p className="text-gray-700 font-medium">Sandeep Chaudhary</p>
                  <p className="text-gray-700 font-medium">Coordinator</p>
                  <p className="text-gray-600">Skill Development Unit</p>
                  <Link
                    href="tel:+919828015958"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors hover:scale-105 transform duration-200"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    +977 9828015958
                  </Link>
                </div>
              </div>
            </div>
            <div
              id="live-training-contact-card"
              className="max-w-sm mx-auto py-8"
            ></div>
          </div>

          {/* Right content - Robot Image */}
          <div className="relative">
            <div className="relative z-10 w-full h-[500px]">
              <img
                src="/sarathi.png"
                alt="Sarathi Robot"
                className="w-full h-full object-contain"
              />
            </div>
            {/* Yellow spotlight effect */}
            <div
              className="absolute top-1/2 right-0 transform -translate-y-1/2 
              w-[400px] h-[400px] bg-yellow-100 rounded-full opacity-50 blur-3xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
