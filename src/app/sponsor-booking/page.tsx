import SponsorBookingForm from "@/components/sponsor-booking";
import { Suspense } from "react";

const BookStallPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <SponsorBookingForm />
      </Suspense>
    </div>
  );
};

export default BookStallPage;
