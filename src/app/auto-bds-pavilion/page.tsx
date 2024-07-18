"use client";

import StallArea from "@/components/stall-area";
import AutoBDSPavilion from "@/components/auto-bds-pavilion";
import { useRouter } from "next/navigation";

const legendItems = [
  { color: "#fccc65", label: "Auto Pavilion (A)" },
  { color: "#ffff", label: "BDS Pavilion(E)" },
  { color: "#fb2e01", label: "Not Available" },
];

const AutoPage = () => {
  const router = useRouter();

  const onAvailableStallClick = (stallId: string) => {
    console.log("Available stall clicked:", stallId);
    router.push(`/book-stall/${stallId}`);
  };

  return (
    <StallArea
      title="Auto and Business Development Service Pavilion"
      subtitle="Auto and BDS Stalls"
      legendItems={legendItems}
      StallComponent={AutoBDSPavilion}
      stallProps={{
        bookedStalls: [""],
        reservedStalls: [""],
        onAvailableStallClick: onAvailableStallClick,
      }}
    />
  );
};

export default AutoPage;
