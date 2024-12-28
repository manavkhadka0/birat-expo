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
            <a
              href="#register"
              className="inline-flex items-center px-6 py-3 rounded-full text-white font-medium 
              bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 
              hover:to-violet-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Register Now
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
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
