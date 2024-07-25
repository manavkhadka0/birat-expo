"use client";

export default function BiratExpo22() {
  return (
    <>
      <img
        src="/22 hero.png"
        alt="Birat Expo 2022"
        className="
      w-full mx-auto"
      />
      <img
        src="/22 1.png"
        alt="Birat Expo 2022"
        className="
      w-full mx-auto"
      />
      <img
        src="/22 2.png"
        alt="Birat Expo 2022"
        className="
      w-full mx-auto"
      />
      <div className="pt-20 pb-40 flex justify-center items-center gap-4 container">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="aspect-w-20 aspect-h-9">
            <iframe
              src="https://www.youtube.com/embed/cdRWX3IoM0s?si=5Ovb6iyv8OBRkNnG"
              title="3D Video 2022"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              className="w-[700px] h-[500px]"
            ></iframe>
          </div>
          <div className="p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              3D Video Birat Expo&apos;22
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="aspect-w-20 aspect-h-9">
            <iframe
              src="https://www.youtube.com/embed/0WxpbTpsYVM"
              title="3D Video 2022"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              className="w-[700px] h-[500px]"
            ></iframe>
          </div>
          <div className="p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              3D Video Birat Expo&apos;22
            </h3>
          </div>
        </div>
      </div>

      {/* https://kantipurtv.com/business/2022/12/25/1671949170.html */}
      {/* embed this link  with proper ui*/}

      <embed
        src="https://kantipurtv.com/business/2022/12/25/1671949170.html"
        className="container h-screen"
      />
    </>
  );
}
