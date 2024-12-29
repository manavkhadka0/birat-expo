"use client";

import { useState, useEffect } from "react";

export default function RegisterPage() {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const formUrl =
    "https://forms.office.com/Pages/ResponsePage.aspx?id=QTLX_XIT30yuqKTPCWFp28_TJZov8fBMuLeMdq3QYLJUNzdKRlRGREJBWjBYMlU1V0s4MDRHVVk4NiQlQCN0PWcu&origin=QRCode";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Register for Startups Hackathon
          </h1>
          <p className="text-gray-300">
            Complete the registration form below to participate in the hackathon
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <iframe
            src={formUrl}
            width="100%"
            height="800px"
            frameBorder="0"
            allowFullScreen
            onLoad={() => setIframeLoaded(true)}
            className="w-full"
          ></iframe>

          <div className="p-8 text-center">
            <p className="text-gray-600">
              If the form doesn&apos;t load, please{" "}
              <a
                href={formUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium underline"
              >
                click here to open it in a new tab
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
