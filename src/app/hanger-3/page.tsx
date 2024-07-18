"use client";

import Hanger3 from "@/components/hanger-3";
import StallArea from "@/components/stall-area";
import { useRouter } from "next/navigation";

const Hanger3Page = () => {
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
      title="Hanger 3"
      subtitle="Agro and SME Stalls"
      legendItems={legendItemsHangers}
      StallComponent={Hanger3}
      stallProps={{
        bookedStalls: [""],
        reservedStalls: [""],
        primeStallsType1: ["B153", "B154", "B228", "B227"],
        primeStallsType2: [
          "B189",
          "B190",
          "B191",
          "B192",
          "B174",
          "B175",
          "B206",
          "B207",
        ],
        toiletStalls: ["B172", "B209"],
        notAvailableStalls: ["b3d4ab18d0"],
        onAvailableStallClick: onAvailableStallClick,
      }}
    />
  );
};

export default Hanger3Page;
