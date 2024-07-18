"use client";

import Sponsors from "@/components/sponsors";
import StallArea from "@/components/stall-area";
import { useRouter } from "next/navigation";

const SponsorsPage = () => {
  const router = useRouter();

  const legendItemsSponsors = [
    { color: "#26abe2", label: "Sponsors" },
    { color: "#fb2e01", label: "Not Available" },
  ];

  const onAvailableStallClick = (stallId: string) => {
    console.log("Available stall clicked:", stallId);
    router.push(`/book-stall/${stallId}`);
  };

  return (
    <StallArea
      title="Sponsors Pavilion"
      subtitle="Sponsor Stalls"
      legendItems={legendItemsSponsors}
      StallComponent={Sponsors}
      stallProps={{
        bookedStalls: [""],
        onAvailableStallClick: onAvailableStallClick,
      }}
    />
  );
};

export default SponsorsPage;
