"use client";

import Food from "@/components/food";
import StallArea from "@/components/stall-area";
import { useRouter } from "next/navigation";

const FoodPage = () => {
  const router = useRouter();

  const legendItemsFood = [
    { color: "#6fbe49", label: "Food Stalls" },
    { color: "#fb2e01", label: "Not Available" },
  ];

  const onAvailableStallClick = (stallId: string) => {
    console.log("Available stall clicked:", stallId);
    router.push(`/book-stall/${stallId}`);
  };

  return (
    <StallArea
      title="Food Stalls"
      subtitle="Food and Beverage Stalls"
      legendItems={legendItemsFood}
      StallComponent={Food}
      stallProps={{
        bookedStalls: [""],
        onAvailableStallClick: onAvailableStallClick,
      }}
    />
  );
};

export default FoodPage;
