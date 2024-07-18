"use client";

import Hanger1 from "@/components/hanger-1";
import StallArea from "@/components/stall-area";
import { useRouter } from "next/navigation";

const Hanger1Page = () => {
  const router = useRouter();

  const legendItemsHangers = [
    { color: "#26abe2", label: "Toilet" },
    { color: "#f5aeae", label: "Prime" },
    { color: "#f3efa3", label: "Prime" },
    { color: "#fb2e01", label: "Not Available" },
  ];

  const onAvailableStallClick = (stallId: string) => {
    console.log("Available stall clicked:", stallId);
    router.push(`/book-stall/${stallId}`);
  };

  return (
    <StallArea
      title="Hanger 1"
      subtitle="Industrial and Corporate Stalls"
      legendItems={legendItemsHangers}
      StallComponent={Hanger1}
      stallProps={{
        bookedStalls: [""],
        toiletStalls: ["B20", "B57"],
        primeStallsType1: ["B1", "B2", "B76", "B75"],
        primeStallsType2: [
          "B37",
          "B38",
          "B39",
          "B40",
          "B22",
          "B23",
          "B54",
          "B55",
        ],
        reservedStalls: [""],
        notAvailableStalls: ["03c0fa4260"],
        onAvailableStallClick: onAvailableStallClick,
      }}
    />
  );
};

export default Hanger1Page;
