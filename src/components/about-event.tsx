import Image from "next/image";

type EventFeatureProps = {
  icon: string;
  title: string;
  description: string;
};
const EventFeature = ({ icon, title, description }: EventFeatureProps) => (
  <div className="flex flex-col items-center text-center">
    <Image src={icon} alt={title} width={80} height={80} className="mb-4" />
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-sm">{description}</p>
  </div>
);

const AboutEvent = () => {
  const features = [
    {
      icon: "/birat-expo-icon.png",
      title: "Birat Expo",
      description: "A 30-year legacy of fostering economic growth in Nepal.",
    },
    {
      icon: "/global-participation-icon.png",
      title: "Global Participation",
      description:
        "Over 250 companies from 10+ countries showcasing diverse industries.",
    },
    {
      icon: "/innovation-hub-icon.png",
      title: "Innovation Hub",
      description:
        "Featuring 300+ exhibition booths, startup pavilions, and hackathons.",
    },
    {
      icon: "/empowering-employment-icon.png",
      title: "Empowering Employment",
      description:
        "Rojgar Koshi Pavilion facilitating job creation and skill development.",
    },
    {
      icon: "/cultural-fusion-icon.png",
      title: "Cultural Fusion",
      description:
        "Experience Nepal's rich heritage through vibrant cultural programs.",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between flex-col md:flex-row gap-8 items-center mb-12">
        <Image src="/logo.png" alt="Birat Expo Logo" width={400} height={400} />
        <h2 className="text-4xl font-bold text-center">
          About <span className="text-blue-500">Event</span>
        </h2>
        <Image
          src="/baliyo-logo.svg"
          alt="Other Logo"
          width={300}
          height={300}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <EventFeature key={index} {...feature} />
        ))}
      </div>
    </div>
  );
};

export default AboutEvent;
