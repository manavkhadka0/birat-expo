import Image from "next/image";

export default function LiveTrainingHero() {
  return (
    <div className="relative min-h-screen overflow">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-8rem)]">
          {/* Left content */}
          <div className="z-10 space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-medium text-white">
                Crafting Careers, Shaping Futures
              </h2>
              <h1 className="text-6xl font-bold">
                <span className="text-white">ROJGAR</span>{" "}
                <span className="text-yellow-400">KOSHI</span>
              </h1>
              <p className="text-gray-200 text-lg max-w-xl">
                Join our interactive session to explore essential skills and
                discover how to transform your passion into a thriving career.
              </p>
            </div>

            <a
              href="/live-training/register"
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

            {/* Training cards */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a href="/live-training/register">
                <div className="bg-white hover:bg-gray-300 p-4 rounded-xl shadow-lg flex items-center gap-4 border border-gray-100">
                  <img
                    src="/cctv.png"
                    alt="CCTV Setup"
                    className="w-12 h-12 object-contain"
                  />
                  <div>
                    <h3 className="font-semibold">CCTV Setup</h3>
                    <p className="text-sm text-gray-500">
                      22<sup>nd</sup> Jan, 2025- 2<sup>nd</sup> Feb, 2025
                    </p>
                  </div>
                </div>
              </a>
              <a href="/live-training/register">
                <div className="bg-white p-4 hover:bg-gray-300 rounded-xl shadow-lg flex items-center gap-4 border border-gray-100">
                  <img
                    src="/coffee.png"
                    alt="Coffee Making"
                    className="w-12 h-12 object-contain"
                  />
                  <div>
                    <h3 className="font-semibold">Coffee Making</h3>
                    <p className="text-sm text-gray-500">
                      22<sup>nd</sup> Jan, 2025- 2<sup>nd</sup> Feb, 2025
                    </p>
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Right content */}
          <div className="relative flex justify-center items-center">
            {/* Logo */}
            <div className="relative z-10">
              <Image
                src="/logo-2025.png"
                alt="Birat Digital Expo 2025"
                width={600}
                height={300}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
