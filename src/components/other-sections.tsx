import Image from "next/image";

const objectives = [
  {
    title: "Economic Development",
    description:
      "Enhance economic activities in Nepal, focusing on the agro-industrial sector and commercialization in the Koshi Province for economic growth.",
  },
  {
    title: "Market Linkages",
    description:
      "Enhance market linkages and visibility of products, providing branding and marketing platforms for businesses.",
  },
  {
    title: "Investment Opportunities",
    description:
      "Attract investors by highlighting investment potential in Koshi Province and facilitate B2B meetings for new partnerships.",
  },
  {
    title: "Technology and Innovation",
    description:
      "Showcase advanced digital technologies for industrial growth and efficiency. Provide a platform for startups to innovate and exhibit their products.",
  },
  {
    title: "Tourism and Culture",
    description:
      "Promote the tourism potential of the Koshi Province by showcasing local attractions, culture, and heritage.",
  },
  {
    title: "Networking",
    description:
      "Bring together producers, processors, traders, and consumers to explore new technologies and business opportunities.",
  },
  {
    title: "Education and Awareness",
    description:
      "Educate participants and visitors about the latest digital technologies and their applications in various industries.",
  },
  {
    title: "Specific Sector Development",
    description:
      "Focus on specific sectors such as agriculture, MSMEs, tourism, and more, providing tailored opportunities and insights for each.",
  },
];

const attractions = [
  {
    title: "Corporate and Industrial Exhibitions",
    description:
      "Featuring national & international participants from various industries",
  },
  {
    title: "Agro-Equipment and Technology Exhibition",
    description:
      "Showcasing the latest in agricultural technology and machinery",
  },
  {
    title: "Agro-Industrial, MSMEs Exhibition",
    description:
      "Highlighting small and medium enterprises in the agro-industrial sector in Nepal",
  },
  {
    title: "Automobile Exhibition",
    description:
      "Featuring the latest models and automotive technology in Nepal",
  },
  {
    title: "Tour Packages",
    description: "Showcasing various destinations in Koshi Province and beyond",
  },
  {
    title: "Sector-specific Seminars",
    description:
      "Insightful discussions on various industry sectors and trends",
  },
  {
    title: "Local Food Festivals",
    description: "Taste the flavors of Koshi Province with local cuisines",
  },
  {
    title: "Cultural Programs",
    description: "Enjoy local music and cultural performances from the region",
  },
  {
    title: "Amusement Park",
    description: "Fun activities for all ages at the event venue",
  },
];

const sponsorshipLevels = [
  {
    title: "Main Sponsor",
    price: "NRS. 75,00,000",
    benefits: [
      "Event title will include company name/logo",
      "Logo on all promotional materials",
      "Branding opportunities at event venues",
      "Company name announced in all stage programs",
      "Promotion through digital board and exhibitor's profile",
      "4 stalls (3x3 m) or similar open space provided",
      "Representative invited as guest in opening and closing ceremonies",
      "Can install welcome gate",
    ],
  },
  {
    title: "Powered By Sponsor",
    price: "NRS. 35,00,000",
    benefits: [
      "Company name & logo used after event name",
      "Logo on all promotional materials",
      "Branding opportunities at event venues",
      "Company name announced in all stage programs",
      "Promotion through digital board and exhibitor's profile",
      "4 stalls (3x3 m) or similar open space provided",
      "Representative invited as guest in opening and closing ceremonies",
      "Can install welcome gate",
    ],
  },
  {
    title: "Platinum Sponsor",
    price: "NRS. 20,00,000",
    benefits: [
      "Logo on all promotional materials",
      "Branding opportunities at event venues",
      "Company name announced in all stage programs",
      "Promotion through digital board and exhibitor's profile",
      "4 stalls (3x3 m) or similar open space provided",
      "Representative invited as guest in opening and closing ceremonies",
      "Can install welcome gate",
    ],
  },
  {
    title: "Diamond Sponsor",
    price: "NRS. 15,00,000",
    benefits: [
      "Logo on all promotional materials",
      "Branding opportunities at event venues",
      "Company name announced in all stage programs",
      "Promotion through digital board and exhibitor's profile",
      "3 stalls (3x3 m) or similar open space provided",
    ],
  },
  {
    title: "Gold Sponsor",
    price: "NRS. 10,00,000",
    benefits: [
      "Logo on all promotional materials",
      "Branding opportunities at event venues",
      "Company name announced in all stage programs",
      "Promotion through digital board and exhibitor's profile",
      "2 stalls (3x3 m) or similar open space provided",
    ],
  },
  {
    title: "Partner (Bank, Insurance, Digital and Others)",
    price: "NRS. 10,00,000",
    benefits: [
      "Logo on all promotional materials",
      "Company name announced in all stage programs",
      "Promotion through digital board and exhibitor's profile",
      "2 stalls (3x3 m) or similar open space provided",
    ],
  },
  {
    title: "Silver Sponsor",
    price: "NRS. 5,00,000",
    benefits: [
      "Logo on all promotional materials",
      "Company name announced in all stage programs",
      "Promotion through digital board and exhibitor's profile",
      "2 stalls (3x3 m) provided",
    ],
  },
];

export const IntroSection = () => (
  <section className="mb-16 text-center">
    <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
      Digital Koshi: Bridging Innovation and Investment
    </h2>
    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
      December 22-31 | Biratnagar
    </p>
    <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
      <p className="text-gray-700">
        Birat Expo is a signature event of Chamber of Industries Morang (CIM),
        organized every 2 years in Biratnagar. It aims to foster market linkages
        between sectors, providing a platform for B2B connections, product
        showcases, and branding opportunities.
      </p>
    </div>
  </section>
);

export const ObjectivesSection = () => (
  <section className="mb-16">
    <h3 className="text-3xl font-bold text-gray-800 mb-6">Our Objectives</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {objectives.map((objective, index) => (
        <div
          key={index}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h4 className="text-xl font-semibold text-blue-600 mb-2">
            {objective.title}
          </h4>
          <p className="text-gray-600">{objective.description}</p>
        </div>
      ))}
    </div>
  </section>
);

export const AttractionsSection = () => (
  <section className="mb-16">
    <h3 className="text-3xl font-bold text-gray-800 mb-6">Major Attractions</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {attractions.map((attraction, index) => (
        <div
          key={index}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h4 className="text-xl font-semibold text-blue-600 mb-2">
            {attraction.title}
          </h4>
          <p className="text-gray-600">{attraction.description}</p>
        </div>
      ))}
    </div>
  </section>
);

export const SponsorshipSection = () => (
  <section className="mb-16">
    <h3 className="text-3xl font-bold text-gray-800 mb-6">
      Sponsorship Opportunities
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sponsorshipLevels.map((level, index) => (
        <div
          key={index}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h4 className="text-2xl font-semibold text-blue-600 mb-2">
            {level.title}
          </h4>
          <p className="text-xl font-bold text-gray-800 mb-4">{level.price}</p>
          <ul className="text-gray-600 list-disc list-inside">
            {level.benefits.map((benefit, i) => (
              <li key={i}>{benefit}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </section>
);
