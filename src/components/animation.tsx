import React from "react";

const Animation = () => {
  return (
    <div className="mx-auto py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-black text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">
          Birat Expo 2025 Animation
        </h2>

        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Experience the official mascot reveal and stunning animation of Birat
          Expo 2025
        </p>

        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src="https://www.youtube.com/embed/s7lyIRZgTXw"
                title="Birat Expo 2025 - Official Mascot Reveal"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                className="w-full h-[640px]"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Animation;
