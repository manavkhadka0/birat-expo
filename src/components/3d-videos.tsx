import React from "react";

const ThreeDVideos = () => {
  return (
    <div className="container mx-auto px-4 py-16 ">
      <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
        3D Videos
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src="https://www.youtube.com/embed/0WxpbTpsYVM"
              title="3D Video 2022"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              className="w-full h-[340px]"
            ></iframe>
          </div>
          <div className="p-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              3D Video &apos;22
            </h3>
            <p className="text-gray-600">
              Experience our groundbreaking 3D technology from 2022.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src="https://www.youtube.com/embed/0WxpbTpsYVM"
              title="3D Video 2024"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              className="w-full h-[340px]"
            ></iframe>
          </div>
          <div className="p-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              3D Video &apos;24
            </h3>
            <p className="text-gray-600">
              Discover the latest advancements in our 3D technology for 2024.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeDVideos;
