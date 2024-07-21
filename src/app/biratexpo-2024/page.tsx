"use client";

export default function BiratExpo24() {
  return (
    <div className="pt-20 pb-40 flex justify-center">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="aspect-w-20 aspect-h-9">
          <iframe
            width="1000"
            height="500"
            src="https://www.youtube.com/embed/8b7Y2vuB9jE?si=IUDS-AAPtV_a04iK"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
          ></iframe>
        </div>
        <div className="p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            3D Video Birat Expo&apos;24
          </h3>
        </div>
      </div>
    </div>
  );
}
