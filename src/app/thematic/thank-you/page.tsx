// pages/thank-you.tsx
import Link from "next/link";

const ThankYouPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center">
        <h1 className="text-3xl font-bold mb-4">
          Thank You for Your Submission
        </h1>
        <p className="text-xl mb-6">
          We have successfully received your request. Our team will review it,
          and you will be informed of the next steps via email shortly.
        </p>
        <p className="text-xl mb-6">Thank you for your patience.</p>
        <Link
          href="/"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default ThankYouPage;
