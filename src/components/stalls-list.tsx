import Link from "next/link";

const stalls = [
  { emoji: "🎪", name: "Automobiles Stalls", href: "/auto-bds-pavilion" },
  { emoji: "🎪", name: "BDS Stalls", href: "/auto-bds-pavilion" },
  {
    emoji: "🎪",
    name: "Hanger 1 : Industrial and Corporate Stalls",
    href: "/hanger-1",
  },
  {
    emoji: "🎪",
    name: "Hanger 2 : Industrial and Corporate Stalls",
    href: "/hanger-2",
  },
  { emoji: "🎪", name: "Food Stalls", href: "/food-stalls" },
];

const StallsList = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
      {stalls.map((stall, index) => (
        <Link href={stall.href} key={index}>
          <div className="flex items-center bg-gray-100 rounded-lg p-3 hover:bg-gray-200 transition duration-200">
            <span className="text-2xl mr-3">{stall.emoji}</span>
            <span className="text-sm font-medium flex-grow">{stall.name}</span>
            <span className="text-gray-400">›</span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default StallsList;
