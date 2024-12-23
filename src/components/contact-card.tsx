import Link from "next/link";

export default function ContactCard() {
  return (
    <div className="max-w-sm mx-auto my-4 p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Contact Coordinator
      </h3>
      <div className="space-y-2">
        <p className="text-gray-700 font-medium">Sandeep Chaudhary</p>
        <p className="text-gray-600">Skill Development Unit (Co-ordinator)</p>
        <Link
          href="tel:+919828015958"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
          +91 9828015958
        </Link>
      </div>
    </div>
  );
}
