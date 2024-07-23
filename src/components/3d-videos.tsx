import React from "react";

const ThreeDVideos = () => {
  return (
    <div className="mx-auto py-20">
      <h2 className="text-4xl font-black text-start mb-12 text-gray-800">
        Birat Expo Visualization
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src="https://www.youtube.com/embed/cdRWX3IoM0s?si=5Ovb6iyv8OBRkNnG"
              title="3D Video 2022"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              className="w-full h-[340px]"
            ></iframe>
          </div>
          <div className="p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Event Tour Birat Expo&apos;22
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src="https://www.youtube.com/embed/8b7Y2vuB9jE?si=IUDS-AAPtV_a04iK"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              className="w-full h-[340px]"
            ></iframe>
          </div>
          <div className="p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              3D Video Birat Expo&apos;24
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeDVideos;
