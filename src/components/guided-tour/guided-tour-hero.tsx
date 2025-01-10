import Image from "next/image";

export default function GuidedTourHero() {
  return (
    <div className="relative min-h-screen overflow">
      {/* Light background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100" />

      {/* Oval gradient */}
      <div className="absolute right-0 bottom-10 w-[100%] h-[450%]">
        <Image
          src="/Oval.png"
          alt="Oval gradient"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Wave image at the bottom */}
      <div className="absolute bottom-0 left-0 w-full">
        <Image
          src="/Wave.svg"
          alt="Wave background"
          width={1920}
          height={144}
          className="w-full h-auto object-cover"
          priority
        />
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[calc(100vh-8rem)]">
          {/* Left content */}
          <div className="z-10 space-y-8">
            <div className="space-y-4">
              <div>
                <h1 className="text-5xl font-bold">
                  <span className="text-white">Guided</span>{" "}
                  <span className="text-yellow-300">Exposure Tour</span>
                </h1>
                <h2 className="text-sm font-medium text-white mt-2">
                  Birat Expo 2025: Exploring Innovation & Opportunities
                </h2>
              </div>
              <div>
                <p className="text-gray-200 text-sm  max-w-xl">
                  The Chamber of Industries Morang (CIM) is organizing the
                  Guided Exposure Tour to Birat Expo 2025 for students and
                  youth. The aim is to create a positive impact by showcasing
                  the positive developments in our society.
                </p>
                <p className="text-gray-200 text-sm max-w-xl mt-4">
                  This guided tour encourages youths to explore local
                  opportunities and gain firsthand experience of industrial and
                  technological advancements in our region.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-x-6">
              <a
                href="/guided-tour/register"
                className="inline-flex items-center px-8 py-4 text-lg rounded-full text-white font-medium 
                bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 
                hover:from-indigo-600 hover:via-indigo-700 hover:to-violet-700 
                transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Register Now
                <svg
                  className="w-6 h-6 ml-2"
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
              <a
                href="#schedule"
                className="text-white font-semibold hover:text-yellow-300 transition-colors duration-200"
              >
                View Schedule <span aria-hidden="true">→</span>
              </a>
            </div>

            {/* Additional info */}
            <div className="text-gray-200 text-sm space-y-1">
              <p>* Limited seats available for each session.</p>
              <p>* Registration is mandatory for participation.</p>
              <p>* First come, first served basis.</p>
            </div>
          </div>

          {/* Right content */}
          <div className="relative flex justify-center items-center">
            {/* Logo */}
            <div className="relative z-10">
              <Image
                src="/mascot.png"
                alt="Birat Digital Expo 2025"
                width={800}
                height={400}
                className="w-120 h-120"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
