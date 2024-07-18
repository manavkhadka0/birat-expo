import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="bg-white px-4 sticky shadow-2xl top-0 z-50">
      <div className="container flex justify-between items-center">
        <Image src="/logo.png" alt="Birat Expo 2024" width={200} height={600} />
        <div className="flex items-center justify-end">
          <div className="relative inline-block text-left group">
            <button
              type="button"
              className="inline-flex justify-center w-full rounded-md shadow-2xl px-4 py-2 bg-white text-sm text-gray-900 font-semibold"
            >
              Book Stalls
              <svg
                className="-mr-1 ml-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>

            <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none invisible group-hover:visible transition-all duration-300 opacity-0 group-hover:opacity-100">
              <div className="py-1">
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-900 font-medium hover:bg-gray-100 hover:text-gray-900"
                >
                  Automobiles Stalls
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-900 font-medium hover:bg-gray-100 hover:text-gray-900"
                >
                  Business Development Service Providers
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-900 font-medium hover:bg-gray-100 hover:text-gray-900"
                >
                  Hanger 1 : Industrial and Corporate Stalls
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-900 font-medium hover:bg-gray-100 hover:text-gray-900"
                >
                  Hanger 2 : Industrial and Corporate Stalls
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-900 font-medium hover:bg-gray-100 hover:text-gray-900"
                >
                  Agro and SME Stalls
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-900 font-medium hover:bg-gray-100 hover:text-gray-900"
                >
                  Food Stalls
                </a>
              </div>
            </div>
          </div>
          <div className="relative inline-block text-left group">
            <button
              type="button"
              className="inline-flex justify-center w-full rounded-md shadow-2xl px-4 py-2 bg-white text-sm text-gray-900 font-semibold"
            >
              Sponsorship
              <svg
                className="-mr-1 ml-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>

            <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none invisible group-hover:visible transition-all duration-300 opacity-0 group-hover:opacity-100">
              <div className="py-1">
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-900 font-medium hover:bg-gray-100 hover:text-gray-900"
                >
                  Main Sponsor
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-900 font-medium hover:bg-gray-100 hover:text-gray-900"
                >
                  Powered By Sponsor
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-900 font-medium hover:bg-gray-100 hover:text-gray-900"
                >
                  Platinum Sponsor
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-900 font-medium hover:bg-gray-100 hover:text-gray-900"
                >
                  Diamond Sponsor
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-900 font-medium hover:bg-gray-100 hover:text-gray-900"
                >
                  Gold Sponsor
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-900 font-medium hover:bg-gray-100 hover:text-gray-900"
                >
                  Partner [Bank, Insurance, Telecom,etc]
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-900 font-medium hover:bg-gray-100 hover:text-gray-900"
                >
                  Silver Sponsor
                </a>
              </div>
            </div>
          </div>
          <Link
            href="/all-stalls"
            className="px-4 py-2 bg-white text-sm text-gray-900 flex flex-col justify-center items-center"
          >
            Birat Expo'24
            <span className="text-[0.6rem] text-green-700 leading-[0.3rem]">
              Coming soon
            </span>
          </Link>
          <Link
            href="/all-stalls"
            className="px-4 py-2 bg-white text-sm text-gray-900 flex flex-col justify-center items-center"
          >
            Birat Expo'22
            <span className="text-[0.6rem] text-red-700 leading-[0.3rem]">
              Past Event
            </span>
          </Link>
          <Link
            href="/all-stalls"
            className="px-4 py-2 bg-white text-xs text-gray-900"
          >
            Floor Plan
          </Link>
          <Link
            href="/floor-plan.pdf"
            target="_blank"
            rel="noreferrer"
            className="bg-blue-900 text-white px-4 py-2 rounded-sm z-50"
          >
            Proposal
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
