export default function TrainingPartners() {
  const partners = [
    {
      name: "Techfinity Solutions & Research Center Pvt. Ltd.",
      logo: "/techfinity.png",
    },
    {
      name: "South Asian School of Tourism & Hotel Management",
      logo: "/sasthm.png",
    },
    {
      name: "Manmohan Technical University",
      logo: "/manmohan.png",
    },
  ];

  return (
    <div className="container max-w-4xl mx-auto px-4 py-16">
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-indigo-500 to-violet-700 bg-clip-text text-transparent">
        Live Training Partners
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {partners.map((partner, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-md text-center"
          >
            <div className="w-32 h-32 mx-auto mb-4">
              <img
                src={partner.logo}
                alt={partner.name}
                className=" h-full object-contain"
              />
            </div>
            <h3 className="text-sm font-medium">{partner.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
