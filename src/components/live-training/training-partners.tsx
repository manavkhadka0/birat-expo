export default function TrainingPartners() {
  const partners = [
    {
      name: "Techfinity Solutions & Research Pvt. Ltd",
      logo: "/techfinity.png",
    },
    {
      name: "South Asian School of Tourism & Hotel Management",
      logo: "/sasthm.png",
    },
  ];

  return (
    <div className="container max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-indigo-500 to-violet-700 bg-clip-text text-transparent">
        Our Training Partners
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {partners.map((partner, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-md text-center"
          >
            <div className="w-32 h-32 mx-auto mb-4">
              <img
                src={partner.logo}
                alt={partner.name}
                className="h-full object-contain"
              />
            </div>
            <h3 className="text-sm font-medium">{partner.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
