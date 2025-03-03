import Image from "next/image";

export default function StartupsHackathonHero() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Light background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100" />

      {/* Oval gradient - repositioned to match design */}
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
                <h1 className="text-6xl font-bold">
                  <span className="text-white">Vision</span>{" "}
                  <span className="text-yellow-300">Koshi</span>
                </h1>
                <h2 className="text-base font-medium text-white">
                  Innovate for Koshi Province
                </h2>
              </div>
              <h3 className="text-white text-4xl font-medium">
                <span className="text-yellow-300">Startup</span> and{" "}
                <span className="text-yellow-300">Hackathon</span>
              </h3>
              <div>
                <p className="text-gray-200 text-lg max-w-xl">
                  Join the Startup and Hackathon to innovate for Koshi Province
                  and win exciting prizes.
                </p>
                <p className="text-gray-200 text-lg max-w-xl">
                  Showcase your skills and make an impact!
                </p>
              </div>
            </div>

            <a
              href="/startups-hackathon/register"
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
          </div>

          {/* Right content */}
          <div className="relative flex justify-center items-center">
            {/* Main logo */}
            <div className="relative z-10">
              <Image
                src="/mascot.png"
                alt="Birat Digital Expo 2025"
                width={600}
                height={300}
                className="w-full h-auto"
                priority
              />
              {/* Small logo underneath */}
              <div className="flex justify-center mt-4">
                <Image
                  src="/logosupdated.svg"
                  alt="Small Logo"
                  width={200}
                  height={150}
                  className="h-auto w-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
