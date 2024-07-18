import Hanger2 from "@/components/hanger-2";
import StallArea from "@/components/stall-area";

const legendItemsHanger2 = [
  { color: "#26abe2", label: "Toilet" },
  { color: "#f5aeae", label: "Prime Type 1" },
  { color: "#f3efa3", label: "Prime Type 2" },
  { color: "#fb2e01", label: "Not Available" },
];

const Hanger2Page = () => (
  <StallArea
    title="Hanger 2"
    subtitle="Industrial and Corporate Stalls"
    legendItems={legendItemsHanger2}
    StallComponent={Hanger2}
    stallProps={{
      primeStallsType1: ["B77", "B78", "B152", "B151"],
      primeStallsType2: [
        "B113",
        "B114",
        "B115",
        "B116",
        "B98",
        "B99",
        "B130",
        "B131",
      ],
      toiletStalls: ["B133", "B96"],
      reservedStalls: [""],
      bookedStalls: [""],
      notAvailableStalls: ["eb1d587ec6"],
    }}
  />
);

export default Hanger2Page;
